import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await verifyToken(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Obtener config de MercadoPago
    const mpConfig = await prisma.mercadoPagoConfig.findFirst({
      where: { isActive: true },
    })

    if (!mpConfig) {
      return NextResponse.json(
        { error: 'MercadoPago no está configurado. Contacta al administrador.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Se requiere orderId' }, { status: 400 })
    }

    // Obtener la orden con items y productos
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        payment: true,
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (order.payment?.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Esta orden ya fue pagada' }, { status: 400 })
    }

    // Construir items para MercadoPago preference
    const items = order.items.map((item) => ({
      id: item.product.sku,
      title: item.product.name.length > 256 ? item.product.name.slice(0, 253) + '...' : item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.unitPrice),
      currency_id: 'MXN',
      description: `SKU: ${item.product.sku}`,
    }))

    // Agregar costo de envío como item si existe
    if (Number(order.shippingCost) > 0) {
      items.push({
        id: 'ENVIO',
        title: 'Costo de envío',
        quantity: 1,
        unit_price: Number(order.shippingCost),
        currency_id: 'MXN',
        description: 'Envío a domicilio',
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sysccom.mx'

    // Crear preferencia en MercadoPago API
    const mpApiUrl = 'https://api.mercadopago.com/checkout/preferences'
    const preferenceBody = {
      items,
      payer: {
        name: order.user.firstName,
        surname: order.user.lastName,
        email: order.user.email,
        phone: order.user.phone ? { number: order.user.phone } : undefined,
      },
      external_reference: order.orderNumber,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      back_urls: {
        success: `${baseUrl}/checkout/mercadopago/success?order=${order.orderNumber}`,
        failure: `${baseUrl}/checkout/mercadopago/failure?order=${order.orderNumber}`,
        pending: `${baseUrl}/checkout/mercadopago/pending?order=${order.orderNumber}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'SYSCCOM',
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        user_id: user.id,
        user_email: user.email,
      },
    }

    const mpResponse = await fetch(mpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mpConfig.accessToken}`,
      },
      body: JSON.stringify(preferenceBody),
    })

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json().catch(() => ({}))
      console.error('[MercadoPago CreatePreference] Error:', JSON.stringify(errorData, null, 2))
      console.error('[MercadoPago CreatePreference] Status:', mpResponse.status)
      console.error('[MercadoPago CreatePreference] Sandbox mode:', mpConfig.isSandbox)

      // Log del error en la orden
      await prisma.orderLog.create({
        data: {
          orderId: order.id,
          type: 'MP_API_CALL',
          message: `Error al crear preferencia MP. Status: ${mpResponse.status}`,
          details: JSON.stringify({
            error: errorData,
            httpStatus: mpResponse.status,
            isSandbox: mpConfig.isSandbox,
            requestBody: { ...preferenceBody, payer: { ...preferenceBody.payer, email: '***' } },
          }),
        },
      })

      return NextResponse.json(
        { error: 'Error al crear la preferencia de pago en MercadoPago', details: errorData },
        { status: 502 }
      )
    }

    const preference = await mpResponse.json()

    console.log(`[MercadoPago CreatePreference] Created preference ${preference.id} for order ${order.orderNumber}`)
    console.log(`[MercadoPago CreatePreference] Sandbox: ${mpConfig.isSandbox}, init_point: ${preference.init_point ? 'YES' : 'NO'}, sandbox_init_point: ${preference.sandbox_init_point ? 'YES' : 'NO'}`)

    // Log de preferencia creada
    await prisma.orderLog.create({
      data: {
        orderId: order.id,
        type: 'MP_API_CALL',
        message: `Preferencia MP creada: ${preference.id}. Sandbox: ${mpConfig.isSandbox}`,
        details: JSON.stringify({
          preferenceId: preference.id,
          initPoint: preference.init_point,
          sandboxInitPoint: preference.sandbox_init_point,
          isSandbox: mpConfig.isSandbox,
        }),
      },
    })

    // Guardar el preference ID en el payment
    if (order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { mercadoPagoId: preference.id },
      })
    }

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: mpConfig.isSandbox ? preference.sandbox_init_point : preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    })
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error)
    return NextResponse.json(
      { error: 'Error interno al procesar el pago' },
      { status: 500 }
    )
  }
}
