'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Clock,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
  ChevronDown,
  Eye,
  X,
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shippingCost: number
  total: number
  notes: string | null
  createdAt: string
  user: { firstName: string; lastName: string; email: string }
  address: { street: string; city: string; state: string }
  items: { id: string; quantity: number; unitPrice: number; product: { name: string; sku: string } }[]
  payment: { method: string; status: string } | null
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  PROCESSING: { label: 'En proceso', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PedidosAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [search, statusFilter])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('sysccom-admin-token')
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('sysccom-admin-token')
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status })
      }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Pedidos</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de pedido o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Todos los estados</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Cargando...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No hay pedidos
          </div>
        ) : (
          orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.PENDING
            const StatusIcon = status.icon
            return (
              <div key={order.id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{order.orderNumber}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {order.user.firstName} {order.user.lastName} · {order.user.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{formatPrice(order.total)}</span>
                    <div className="flex items-center gap-1">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>{statusConfig[s].label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Pedido {selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Cliente</h4>
                <p className="text-sm">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Dirección de envío</h4>
                <p className="text-sm">{selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Productos</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span>{formatPrice(selectedOrder.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
              {selectedOrder.payment && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Pago</h4>
                  <p className="text-sm">
                    Método: {selectedOrder.payment.method} · Estado: {selectedOrder.payment.status}
                  </p>
                </div>
              )}
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Notas</h4>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
