import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await verifyToken(request)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { select: { url: true }, take: 1 },
              },
            },
          },
        },
        address: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      address: order.address,
      payment: order.payment ? {
        method: order.payment.method,
        status: order.payment.status,
        paidAt: order.payment.paidAt,
      } : null,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0]?.url || null,
        },
      })),
    }))

    return Response.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Get orders error:', error)
    return Response.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}
