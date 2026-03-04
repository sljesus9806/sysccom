'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

interface AdvancedStats {
  monthlyRevenue: { month: string; revenue: number; orders: number }[]
  ordersByStatus: { status: string; count: number }[]
  topProducts: { id: string; name: string; sold: number; revenue: number; stock: number }[]
  topCategories: { name: string; products: number }[]
  monthlyCustomers: { month: string; count: number }[]
  lowStockProducts: { id: string; name: string; sku: string; stock: number }[]
  paymentMethods: { method: string; count: number; total: number }[]
  summary: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    totalCustomers: number
    avgOrderValue: number
  }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-500' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-500' },
  PROCESSING: { label: 'En proceso', color: 'bg-indigo-500' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-500' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-500' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500' },
}

const paymentLabels: Record<string, string> = {
  CARD: 'Tarjeta',
  SPEI: 'SPEI',
  OXXO: 'OXXO',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
}

export default function EstadisticasAdmin() {
  const [stats, setStats] = useState<AdvancedStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('sysccom-admin-token')
      const res = await fetch('/api/admin/stats/advanced', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setStats(await res.json())
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-center text-gray-400 py-10">Error al cargar estadísticas</p>
  }

  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1)
  const maxCustomers = Math.max(...stats.monthlyCustomers.map((m) => m.count), 1)
  const totalStatusOrders = stats.ordersByStatus.reduce((sum, s) => sum + s.count, 0) || 1
  const maxCategoryProducts = Math.max(...stats.topCategories.map((c) => c.products), 1)

  // Calculate month-over-month revenue change
  const currentMonthRevenue = stats.monthlyRevenue[stats.monthlyRevenue.length - 1]?.revenue || 0
  const prevMonthRevenue = stats.monthlyRevenue[stats.monthlyRevenue.length - 2]?.revenue || 0
  const revenueChange = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Estadísticas y Reportes</h2>
        <p className="text-sm text-gray-500">Vista general del rendimiento de tu tienda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Ingresos Totales', value: formatPrice(stats.summary.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
          { label: 'Pedidos', value: stats.summary.totalOrders, icon: ShoppingCart, color: 'bg-blue-500' },
          { label: 'Productos Activos', value: stats.summary.totalProducts, icon: Package, color: 'bg-purple-500' },
          { label: 'Clientes', value: stats.summary.totalCustomers, icon: Users, color: 'bg-orange-500' },
          { label: 'Ticket Promedio', value: formatPrice(stats.summary.avgOrderValue), icon: CreditCard, color: 'bg-pink-500' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`${card.color} w-8 h-8 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-bold">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Ingresos Mensuales</h3>
            <p className="text-sm text-gray-500">Últimos 6 meses</p>
          </div>
          {revenueChange !== 0 && (
            <span className={`flex items-center gap-1 text-sm font-medium ${revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueChange > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(revenueChange).toFixed(1)}% vs mes anterior
            </span>
          )}
        </div>
        <div className="flex items-end gap-2 h-48">
          {stats.monthlyRevenue.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-700">{formatPrice(m.revenue)}</span>
              <div
                className="w-full bg-primary-500 rounded-t-md transition-all min-h-[4px]"
                style={{ height: `${(m.revenue / maxRevenue) * 160}px` }}
              />
              <span className="text-xs text-gray-500">{m.month}</span>
              <span className="text-xs text-gray-400">{m.orders} pedidos</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Pedidos por Estado</h3>
          <div className="space-y-3">
            {stats.ordersByStatus.map((s) => {
              const info = statusLabels[s.status] || { label: s.status, color: 'bg-gray-500' }
              const pct = ((s.count / totalStatusOrders) * 100).toFixed(1)
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{info.label}</span>
                    <span className="text-sm font-medium">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${info.color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* New Customers Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Nuevos Clientes por Mes</h3>
          <div className="flex items-end gap-2 h-40">
            {stats.monthlyCustomers.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{m.count}</span>
                <div
                  className="w-full bg-green-500 rounded-t-md transition-all min-h-[4px]"
                  style={{ height: `${(m.count / maxCustomers) * 120}px` }}
                />
                <span className="text-xs text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top 10 Productos por Ventas</h3>
          <div className="space-y-2">
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin datos de ventas</p>
            ) : (
              stats.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-sm font-bold text-gray-300 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sold} vendidos · Stock: {p.stock}</p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Productos por Categoría</h3>
          <div className="space-y-3">
            {stats.topCategories.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{c.name}</span>
                  <span className="text-sm font-medium">{c.products}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${(c.products / maxCategoryProducts) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
          {stats.paymentMethods.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin datos de pagos</p>
          ) : (
            <div className="space-y-4">
              {stats.paymentMethods.map((pm) => (
                <div key={pm.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{paymentLabels[pm.method] || pm.method}</p>
                      <p className="text-xs text-gray-400">{pm.count} transacciones</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(pm.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Alerta de Stock Bajo</h3>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-green-600 text-center py-4">
              <TrendingUp className="w-5 h-5 mx-auto mb-1" />
              Todos los productos tienen stock suficiente
            </p>
          ) : (
            <div className="space-y-2">
              {stats.lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
