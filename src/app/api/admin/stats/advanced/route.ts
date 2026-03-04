import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const now = new Date()

  // Last 6 months revenue data
  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
    const result = await prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
      },
    })
    monthlyRevenue.push({
      month: start.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
      revenue: Number(result._sum.total || 0),
      orders: result._count,
    })
  }

  // Orders by status
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  })

  // Top 10 products by revenue
  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  })
  const topProducts = await Promise.all(
    topProductsRaw.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, price: true, stock: true },
      })
      return {
        id: product?.id || item.productId,
        name: product?.name || 'Eliminado',
        sold: item._sum.quantity || 0,
        revenue: (item._sum.quantity || 0) * Number(product?.price || 0),
        stock: product?.stock || 0,
      }
    })
  )

  // Top categories by product count
  const categoriesRaw = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { products: { _count: 'desc' } },
    take: 8,
  })
  const topCategories = categoriesRaw.map((c) => ({
    name: c.name,
    products: c._count.products,
  }))

  // New customers per month (last 6 months)
  const monthlyCustomers = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
    const count = await prisma.user.count({
      where: { role: 'CUSTOMER', createdAt: { gte: start, lte: end } },
    })
    monthlyCustomers.push({
      month: start.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
      count,
    })
  }

  // Low stock products
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 5 }, isActive: true },
    select: { id: true, name: true, sku: true, stock: true },
    orderBy: { stock: 'asc' },
    take: 10,
  })

  // Payment methods distribution
  const paymentMethods = await prisma.payment.groupBy({
    by: ['method'],
    _count: true,
    _sum: { amount: true },
  })

  // Summary totals
  const [totalRevenue, totalOrders, totalProducts, totalCustomers, avgOrderValue] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.aggregate({ _avg: { total: true }, where: { status: { not: 'CANCELLED' } } }),
  ])

  return NextResponse.json({
    monthlyRevenue,
    ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count })),
    topProducts,
    topCategories,
    monthlyCustomers,
    lowStockProducts,
    paymentMethods: paymentMethods.map((p) => ({
      method: p.method,
      count: p._count,
      total: Number(p._sum.amount || 0),
    })),
    summary: {
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalOrders,
      totalProducts,
      totalCustomers,
      avgOrderValue: Number(avgOrderValue._avg.total || 0),
    },
  })
}
