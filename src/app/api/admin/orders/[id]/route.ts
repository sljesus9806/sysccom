import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const body = await request.json()
  const newStatus = body.status

  // Obtener la orden con su pago
  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  // Si el método de pago es MERCADOPAGO y el pago está PENDING,
  // no permitir cambio de status a menos que hayan pasado 72hrs
  if (
    order.payment?.method === 'MERCADOPAGO' &&
    order.payment?.status === 'PENDING'
  ) {
    const hoursSinceCreated = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)

    if (hoursSinceCreated < 72) {
      const hoursRemaining = Math.ceil(72 - hoursSinceCreated)

      await prisma.orderLog.create({
        data: {
          orderId: id,
          type: 'ADMIN_ACTION',
          message: `Intento de cambio de status bloqueado: ${order.status} → ${newStatus}. Pago MercadoPago pendiente de confirmación.`,
          details: JSON.stringify({
            attemptedBy: user.email,
            hoursSinceCreated: Math.round(hoursSinceCreated),
            hoursRemaining,
          }),
        },
      })

      return NextResponse.json(
        {
          error: `No se puede cambiar el estado del pedido. El pago de MercadoPago aún está pendiente de confirmación. Podrás editar el estado manualmente en ${hoursRemaining} horas si MercadoPago no confirma el pago.`,
        },
        { status: 403 }
      )
    }
  }

  // Registrar el cambio de status
  await prisma.orderLog.create({
    data: {
      orderId: id,
      type: 'ADMIN_ACTION',
      message: `Status cambiado manualmente: ${order.status} → ${newStatus}`,
      details: JSON.stringify({
        changedBy: user.email,
        previousStatus: order.status,
        newStatus,
      }),
    },
  })

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: newStatus },
  })

  return NextResponse.json(updatedOrder)
}
