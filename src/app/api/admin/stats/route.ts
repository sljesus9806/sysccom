import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalProducts,
    activeProducts,
    lowStockProducts,
    totalClients,
    newClientsThisMonth,
    totalOrders,
    pendingOrders,
    revenueResult,
    revenueMonthResult,
    topProductsResult,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfMonth } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    }),
  ])

  // Get product details for top products
  const topProducts = await Promise.all(
    topProductsResult.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, price: true },
      })
      return {
        id: product?.id || item.productId,
        name: product?.name || 'Producto eliminado',
        sold: item._sum.quantity || 0,
        revenue: (item._sum.quantity || 0) * Number(product?.price || 0),
      }
    })
  )

  return NextResponse.json({
    totalProducts,
    activeProducts,
    lowStockProducts,
    totalClients,
    newClientsThisMonth,
    totalOrders,
    pendingOrders,
    totalRevenue: Number(revenueResult._sum.total || 0),
    revenueThisMonth: Number(revenueMonthResult._sum.total || 0),
    topProducts,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    })),
  })
}
