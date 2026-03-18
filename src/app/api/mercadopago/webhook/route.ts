import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail, sendNewOrderNotificationToAdmin } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[MercadoPago Webhook] Received:', JSON.stringify(body, null, 2))

    // Verificar firma del webhook si hay secret configurado
    const mpConfig = await prisma.mercadoPagoConfig.findFirst({
      where: { isActive: true },
    })

    if (!mpConfig) {
      console.error('[MercadoPago Webhook] No config found')
      return NextResponse.json({ error: 'Not configured' }, { status: 503 })
    }

    // Verificar la firma x-signature si hay webhook secret
    if (mpConfig.webhookSecret) {
      const xSignature = request.headers.get('x-signature')
      const xRequestId = request.headers.get('x-request-id')

      if (xSignature && xRequestId) {
        const parts = xSignature.split(',')
        const tsValue = parts.find(p => p.trim().startsWith('ts='))?.split('=')[1]
        const hashValue = parts.find(p => p.trim().startsWith('v1='))?.split('=')[1]

        if (tsValue && hashValue) {
          const dataId = body.data?.id || ''
          const manifest = `id:${dataId};request-id:${xRequestId};ts:${tsValue};`
          const computedHash = crypto
            .createHmac('sha256', mpConfig.webhookSecret)
            .update(manifest)
            .digest('hex')

          if (computedHash !== hashValue) {
            console.error('[MercadoPago Webhook] Invalid signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
          }
        }
      }
    }

    // Solo procesar notificaciones de pago
    if (body.type === 'payment' || body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data?.id

      if (!paymentId) {
        return NextResponse.json({ received: true })
      }

      // Consultar el pago en la API de MercadoPago
      console.log(`[MercadoPago Webhook] Fetching payment ${paymentId} from MP API...`)

      const mpPaymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${mpConfig.accessToken}`,
          },
        }
      )

      if (!mpPaymentResponse.ok) {
        const errorBody = await mpPaymentResponse.text()
        console.error(`[MercadoPago Webhook] Failed to fetch payment: ${mpPaymentResponse.status} - ${errorBody}`)
        return NextResponse.json({ error: 'Failed to verify payment' }, { status: 502 })
      }

      const mpPayment = await mpPaymentResponse.json()
      const externalReference = mpPayment.external_reference

      console.log(`[MercadoPago Webhook] Payment ${paymentId} status: ${mpPayment.status} for order: ${externalReference}`)
      console.log(`[MercadoPago Webhook] Payment details:`, JSON.stringify({
        id: mpPayment.id,
        status: mpPayment.status,
        status_detail: mpPayment.status_detail,
        payment_method_id: mpPayment.payment_method_id,
        payment_type_id: mpPayment.payment_type_id,
        transaction_amount: mpPayment.transaction_amount,
        currency_id: mpPayment.currency_id,
        date_created: mpPayment.date_created,
        date_approved: mpPayment.date_approved,
        external_reference: mpPayment.external_reference,
      }, null, 2))

      if (!externalReference) {
        console.warn('[MercadoPago Webhook] No external_reference in payment, skipping')
        return NextResponse.json({ received: true })
      }

      // Buscar la orden por su número
      const order = await prisma.order.findUnique({
        where: { orderNumber: externalReference },
        include: {
          payment: true,
          user: true,
          items: { include: { product: true } },
          address: true,
        },
      })

      if (!order) {
        console.error(`[MercadoPago Webhook] Order not found: ${externalReference}`)
        return NextResponse.json({ received: true })
      }

      // Log del webhook recibido
      await prisma.orderLog.create({
        data: {
          orderId: order.id,
          type: 'PAYMENT_WEBHOOK',
          message: `Webhook recibido de MercadoPago. Payment ID: ${paymentId}, Status: ${mpPayment.status}, Detail: ${mpPayment.status_detail || 'N/A'}`,
          details: JSON.stringify({
            webhookBody: body,
            mpPaymentId: paymentId,
            mpStatus: mpPayment.status,
            mpStatusDetail: mpPayment.status_detail,
            mpPaymentMethodId: mpPayment.payment_method_id,
            mpPaymentTypeId: mpPayment.payment_type_id,
            mpTransactionAmount: mpPayment.transaction_amount,
            mpDateCreated: mpPayment.date_created,
            mpDateApproved: mpPayment.date_approved,
            isSandbox: mpConfig.isSandbox,
          }),
        },
      })

      // Mapear el estado de MercadoPago a nuestro sistema
      let paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' = 'PENDING'
      let orderStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' = 'PENDING'

      switch (mpPayment.status) {
        case 'approved':
          paymentStatus = 'COMPLETED'
          orderStatus = 'CONFIRMED'
          break
        case 'rejected':
        case 'cancelled':
          paymentStatus = 'FAILED'
          orderStatus = 'CANCELLED'
          break
        case 'refunded':
          paymentStatus = 'REFUNDED'
          orderStatus = 'CANCELLED'
          break
        case 'in_process':
        case 'pending':
        case 'authorized':
          paymentStatus = 'PENDING'
          orderStatus = 'PENDING'
          break
      }

      const previousPaymentStatus = order.payment?.status
      const previousOrderStatus = order.status

      // Actualizar payment y orden
      if (order.payment) {
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: paymentStatus,
            transactionId: String(paymentId),
            mercadoPagoId: String(paymentId),
            paidAt: paymentStatus === 'COMPLETED' ? new Date() : null,
          },
        })
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: orderStatus },
      })

      // Log del cambio de status
      await prisma.orderLog.create({
        data: {
          orderId: order.id,
          type: 'STATUS_CHANGE',
          message: `Status actualizado por webhook MP. Pago: ${previousPaymentStatus} → ${paymentStatus}. Orden: ${previousOrderStatus} → ${orderStatus}`,
          details: JSON.stringify({
            previousPaymentStatus,
            newPaymentStatus: paymentStatus,
            previousOrderStatus,
            newOrderStatus: orderStatus,
            mpStatus: mpPayment.status,
            mpStatusDetail: mpPayment.status_detail,
            triggeredBy: 'mercadopago_webhook',
          }),
        },
      })

      // Si el pago fue aprobado, enviar notificaciones
      if (paymentStatus === 'COMPLETED') {
        console.log(`[MercadoPago Webhook] Payment APPROVED for order ${order.orderNumber}. Sending notifications...`)

        // Email de confirmación al cliente
        sendOrderConfirmationEmail(
          order.user.email,
          order.user.firstName,
          order.orderNumber,
          Number(order.total)
        ).catch((err) => console.error('Failed to send confirmation email:', err))

        // Notificación interna a ventas@sysccom.com
        const itemsSummary = order.items.map((item) => ({
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
        }))

        sendNewOrderNotificationToAdmin({
          orderNumber: order.orderNumber,
          customerName: `${order.user.firstName} ${order.user.lastName}`,
          customerEmail: order.user.email,
          customerPhone: order.user.phone || 'No proporcionado',
          items: itemsSummary,
          subtotal: Number(order.subtotal),
          shippingCost: Number(order.shippingCost),
          total: Number(order.total),
          paymentMethod: 'MercadoPago',
          paymentId: String(paymentId),
          shippingAddress: order.address
            ? `${order.address.street}, ${order.address.colony}, ${order.address.city}, ${order.address.state} C.P. ${order.address.postalCode}`
            : 'No disponible',
          notes: order.notes || undefined,
        }).catch((err) => console.error('Failed to send admin notification:', err))
      }

      // Si el pago fue rechazado/cancelado, restaurar stock
      if (paymentStatus === 'FAILED' || paymentStatus === 'REFUNDED') {
        console.log(`[MercadoPago Webhook] Payment ${paymentStatus} for order ${order.orderNumber}. Restoring stock...`)

        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }

        await prisma.orderLog.create({
          data: {
            orderId: order.id,
            type: 'STATUS_CHANGE',
            message: `Stock restaurado por pago ${paymentStatus === 'FAILED' ? 'rechazado' : 'reembolsado'}`,
            details: JSON.stringify({
              items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
            }),
          },
        })
      }
    } else {
      console.log(`[MercadoPago Webhook] Ignoring non-payment notification: type=${body.type}, action=${body.action}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[MercadoPago Webhook] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
