import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendOrderConfirmationEmail } from '@/lib/email'

interface CartItemInput {
  productId: string
  quantity: number
}

export async function POST(request: NextRequest) {
  const user = await verifyToken(request)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      paymentMethod,
      shippingAddress,
      shippingCost,
      couponCode,
      notes,
      items: cartItemsInput,
    } = body

    // Validate payment method
    if (!['CARD', 'SPEI', 'OXXO'].includes(paymentMethod)) {
      return Response.json({ error: 'Método de pago inválido' }, { status: 400 })
    }

    if (!shippingAddress) {
      return Response.json({ error: 'Dirección de envío requerida' }, { status: 400 })
    }

    // Validate cart items from frontend
    if (!Array.isArray(cartItemsInput) || cartItemsInput.length === 0) {
      return Response.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    // Validate each item has required fields
    for (const item of cartItemsInput as CartItemInput[]) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return Response.json({ error: 'Datos de producto inválidos' }, { status: 400 })
      }
    }

    // Fetch actual products from DB to verify prices and stock
    const productIds = (cartItemsInput as CartItemInput[]).map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    if (products.length !== productIds.length) {
      return Response.json(
        { error: 'Algunos productos ya no están disponibles' },
        { status: 400 }
      )
    }

    // Build cart items with verified prices and check stock
    const productMap = new Map(products.map((p) => [p.id, p]))
    const verifiedItems: { productId: string; quantity: number; unitPrice: number }[] = []
    const stockErrors: string[] = []

    for (const item of cartItemsInput as CartItemInput[]) {
      const product = productMap.get(item.productId)!
      if (product.stock < item.quantity) {
        stockErrors.push(
          `"${product.name}" solo tiene ${product.stock} unidad(es) disponible(s)`
        )
      }
      verifiedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(product.price),
      })
    }

    if (stockErrors.length > 0) {
      return Response.json(
        { error: 'Stock insuficiente', details: stockErrors },
        { status: 400 }
      )
    }

    // Calculate subtotal from verified DB prices (not frontend prices)
    let subtotal = 0
    for (const item of verifiedItems) {
      subtotal += item.unitPrice * item.quantity
    }

    // Apply coupon if provided
    let discount = 0
    let appliedPromotion = null
    if (couponCode) {
      const promotion = await prisma.promotion.findUnique({
        where: { code: couponCode.toUpperCase() },
      })

      if (promotion && promotion.isActive) {
        const now = new Date()
        if (now >= promotion.startDate && now <= promotion.endDate) {
          if (!promotion.maxUses || promotion.usedCount < promotion.maxUses) {
            if (!promotion.minPurchase || subtotal >= Number(promotion.minPurchase)) {
              appliedPromotion = promotion

              switch (promotion.type) {
                case 'PERCENTAGE':
                  discount = subtotal * (Number(promotion.value) / 100)
                  break
                case 'FIXED':
                  discount = Math.min(Number(promotion.value), subtotal)
                  break
                case 'FREE_SHIPPING':
                  break
              }
            }
          }
        }
      }
    }

    const finalShippingCost = appliedPromotion?.type === 'FREE_SHIPPING' ? 0 : (shippingCost || 0)
    const total = subtotal - discount + finalShippingCost

    // Create address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: 'Envío',
        street: shippingAddress.street,
        colony: shippingAddress.colony,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: 'México',
      },
    })

    // Generate order number using random suffix to avoid race conditions
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const orderNumber = `SYSC-${dateStr}-${randomSuffix}`

    // Create order with items and decrement stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock for each product
      for (const item of verifiedItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        })

        if (updated.count === 0) {
          throw new Error(`Stock insuficiente para producto ${item.productId}`)
        }
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          addressId: address.id,
          status: 'PENDING',
          subtotal,
          shippingCost: finalShippingCost,
          total,
          notes: notes || null,
          items: {
            create: verifiedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
          payment: {
            create: {
              method: paymentMethod,
              status: 'PENDING',
              amount: total,
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      })

      return newOrder
    })

    // Update promotion usage
    if (appliedPromotion) {
      await prisma.promotion.update({
        where: { id: appliedPromotion.id },
        data: { usedCount: { increment: 1 } },
      })
    }

    // Generate payment reference based on method
    let paymentInfo: Record<string, string> = {}

    const speiClabe = process.env.SPEI_CLABE || '000000000000000000'
    const speiBanco = process.env.SPEI_BANCO || 'STP'
    const speiBeneficiario = process.env.SPEI_BENEFICIARIO || 'SYSCCOM Integradores S.A. de C.V.'

    if (paymentMethod === 'SPEI') {
      paymentInfo = {
        clabe: speiClabe,
        banco: speiBanco,
        beneficiario: speiBeneficiario,
        referencia: order.orderNumber.replace(/-/g, ''),
        concepto: `Pedido ${order.orderNumber}`,
      }
    } else if (paymentMethod === 'OXXO') {
      const oxxoRef = `9999${Date.now().toString().slice(-10)}`
      paymentInfo = {
        referencia: oxxoRef,
        monto: total.toFixed(2),
        vigencia: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      }
    } else if (paymentMethod === 'CARD') {
      // Placeholder: en produccion se integra con Conekta
      paymentInfo = {
        status: 'pending_payment_integration',
        message: 'Pedido creado. El pago será procesado por el gateway de pago.',
      }
    }

    // Send order confirmation email (non-blocking)
    sendOrderConfirmationEmail(
      user.email,
      user.firstName,
      order.orderNumber,
      total
    ).catch((err) => {
      console.error('Failed to send order confirmation email:', err)
    })

    return Response.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total,
        subtotal,
        shippingCost: finalShippingCost,
        discount,
        status: order.status,
        paymentMethod,
        paymentInfo,
        itemCount: verifiedItems.length,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    const message = error instanceof Error && error.message.includes('Stock insuficiente')
      ? error.message
      : 'Error al crear el pedido'
    return Response.json({ error: message }, { status: 500 })
  }
}
