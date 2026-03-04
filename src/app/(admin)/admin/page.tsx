'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  totalClients: number
  newClientsThisMonth: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  revenueThisMonth: number
  topProducts: { id: string; name: string; sold: number; revenue: number }[]
  recentOrders: {
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }[]
}

const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  PROCESSING: { label: 'En proceso', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('sysccom-admin-token')
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
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

  const cards = [
    {
      label: 'Productos Activos',
      value: stats?.activeProducts ?? 0,
      subtitle: `${stats?.lowStockProducts ?? 0} con stock bajo`,
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/productos',
    },
    {
      label: 'Clientes',
      value: stats?.totalClients ?? 0,
      subtitle: `+${stats?.newClientsThisMonth ?? 0} este mes`,
      icon: Users,
      color: 'bg-green-500',
      href: '/admin/clientes',
    },
    {
      label: 'Pedidos',
      value: stats?.totalOrders ?? 0,
      subtitle: `${stats?.pendingOrders ?? 0} pendientes`,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      href: '/admin/pedidos',
    },
    {
      label: 'Ingresos del Mes',
      value: formatPrice(stats?.revenueThisMonth ?? 0),
      subtitle: `Total: ${formatPrice(stats?.totalRevenue ?? 0)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      href: '/admin/pedidos',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold mt-3">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.subtitle}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pedidos Recientes</h2>
            <Link href="/admin/pedidos" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentOrders ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 p-5 text-center">No hay pedidos aún</p>
            ) : (
              stats?.recentOrders.map((order) => {
                const status = statusLabels[order.status] || statusLabels.PENDING
                const StatusIcon = status.icon
                return (
                  <div key={order.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.customerName}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Productos Más Vendidos</h2>
            <Link
              href="/admin/productos"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.topProducts ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 p-5 text-center">Sin datos de ventas aún</p>
            ) : (
              stats?.topProducts.map((product, i) => (
                <div key={product.id} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sold} vendidos</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(product.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
