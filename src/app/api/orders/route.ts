import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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
    } = body

    // Validate payment method
    if (!['CARD', 'SPEI', 'OXXO'].includes(paymentMethod)) {
      return Response.json({ error: 'Método de pago inválido' }, { status: 400 })
    }

    if (!shippingAddress) {
      return Response.json({ error: 'Dirección de envío requerida' }, { status: 400 })
    }

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return Response.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    // Calculate subtotal
    let subtotal = 0
    for (const item of cartItems) {
      subtotal += Number(item.product.price) * item.quantity
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
                  // Will be applied to shipping cost below
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

    // Generate order number
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    })
    const orderNumber = `SYSC-${dateStr}-${String(count + 1).padStart(3, '0')}`

    // Create order with items
    const order = await prisma.order.create({
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
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
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

    // Update promotion usage
    if (appliedPromotion) {
      await prisma.promotion.update({
        where: { id: appliedPromotion.id },
        data: { usedCount: { increment: 1 } },
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: user.id } })

    // Generate payment reference based on method
    let paymentInfo: Record<string, string> = {}

    if (paymentMethod === 'SPEI') {
      paymentInfo = {
        clabe: '646180157042875631',
        banco: 'STP',
        beneficiario: 'SYSCCOM Integradores S.A. de C.V.',
        referencia: order.orderNumber.replace(/-/g, ''),
        concepto: `Pedido ${order.orderNumber}`,
      }
    } else if (paymentMethod === 'OXXO') {
      // Generate OXXO reference (14 digits)
      const oxxoRef = `9999${Date.now().toString().slice(-10)}`
      paymentInfo = {
        referencia: oxxoRef,
        monto: total.toFixed(2),
        vigencia: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      }
    } else if (paymentMethod === 'CARD') {
      // In production, this would integrate with Stripe/Conekta
      paymentInfo = {
        status: 'redirect_to_payment',
        message: 'En producción, aquí se redirige al gateway de pago',
      }
      // Simulate successful payment
      await prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
        },
      })
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
      })
    }

    return Response.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total,
        subtotal,
        shippingCost: finalShippingCost,
        discount,
        status: paymentMethod === 'CARD' ? 'CONFIRMED' : 'PENDING',
        paymentMethod,
        paymentInfo,
        itemCount: cartItems.length,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return Response.json({ error: 'Error al crear el pedido' }, { status: 500 })
  }
}
