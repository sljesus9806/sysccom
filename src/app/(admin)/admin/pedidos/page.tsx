'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Clock,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
  Eye,
  X,
  FileText,
  CreditCard,
  Lock,
} from 'lucide-react'

interface OrderLog {
  id: string
  type: string
  message: string
  details: string | null
  createdAt: string
}

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
  payment: { method: string; status: string; mercadoPagoId: string | null; transactionId: string | null; paidAt: string | null; createdAt: string } | null
  logs: OrderLog[]
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  PROCESSING: { label: 'En proceso', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Pagado', color: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Fallido', color: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-700' },
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

function isStatusLocked(order: Order): boolean {
  if (order.payment?.method !== 'MERCADOPAGO' || order.payment?.status !== 'PENDING') return false
  const hoursSinceCreated = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
  return hoursSinceCreated < 72
}

function getHoursRemaining(order: Order): number {
  const hoursSinceCreated = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
  return Math.ceil(72 - hoursSinceCreated)
}

const logTypeConfig: Record<string, { label: string; color: string }> = {
  PAYMENT_WEBHOOK: { label: 'Webhook MP', color: 'bg-blue-100 text-blue-700' },
  STATUS_CHANGE: { label: 'Cambio Status', color: 'bg-purple-100 text-purple-700' },
  ADMIN_ACTION: { label: 'Acción Admin', color: 'bg-orange-100 text-orange-700' },
  MP_API_CALL: { label: 'API MP', color: 'bg-cyan-100 text-cyan-700' },
}

export default function PedidosAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showLogs, setShowLogs] = useState(false)
  const [statusError, setStatusError] = useState('')

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
    setStatusError('')
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
    } else {
      const data = await res.json()
      setStatusError(data.error || 'Error al actualizar el estado')
      // Re-fetch to reset select value
      fetchOrders()
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Pedidos</h2>

      {/* Status error toast */}
      {statusError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{statusError}</p>
          </div>
          <button onClick={() => setStatusError('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            const locked = isStatusLocked(order)
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
                      {order.payment && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusConfig[order.payment.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                          <CreditCard className="w-3 h-3" />
                          {paymentStatusConfig[order.payment.status]?.label || order.payment.status}
                        </span>
                      )}
                      {locked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700" title={`Bloqueado por ${getHoursRemaining(order)}hrs hasta confirmación de MercadoPago`}>
                          <Lock className="w-3 h-3" />
                          {getHoursRemaining(order)}hrs
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {order.user.firstName} {order.user.lastName} · {order.user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      {order.payment?.method && (
                        <span className="text-xs text-gray-400">· {order.payment.method}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{formatPrice(order.total)}</span>
                    <div className="flex items-center gap-1">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={locked}
                        className={`text-xs border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none ${locked ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                        title={locked ? `Bloqueado: esperando confirmación de MercadoPago (${getHoursRemaining(order)}hrs restantes)` : ''}
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>{statusConfig[s].label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { setSelectedOrder(order); setShowLogs(false) }}
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
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Pedido {selectedOrder.orderNumber}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showLogs ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Logs ({selectedOrder.logs?.length || 0})
                </button>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {!showLogs ? (
                <>
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
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        Información de Pago
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Método:</span>{' '}
                          <span className="font-medium">{selectedOrder.payment.method}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Estado:</span>{' '}
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${paymentStatusConfig[selectedOrder.payment.status]?.color || ''}`}>
                            {paymentStatusConfig[selectedOrder.payment.status]?.label || selectedOrder.payment.status}
                          </span>
                        </div>
                        {selectedOrder.payment.mercadoPagoId && (
                          <div className="col-span-2">
                            <span className="text-gray-500">MP ID:</span>{' '}
                            <span className="font-mono text-xs">{selectedOrder.payment.mercadoPagoId}</span>
                          </div>
                        )}
                        {selectedOrder.payment.transactionId && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Transaction ID:</span>{' '}
                            <span className="font-mono text-xs">{selectedOrder.payment.transactionId}</span>
                          </div>
                        )}
                        {selectedOrder.payment.paidAt && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Pagado el:</span>{' '}
                            <span>{formatDate(selectedOrder.payment.paidAt)}</span>
                          </div>
                        )}
                      </div>
                      {isStatusLocked(selectedOrder) && (
                        <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700">
                          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <p>
                            El cambio de estado está bloqueado. Esperando confirmación de pago de MercadoPago.
                            Se podrá editar manualmente en <strong>{getHoursRemaining(selectedOrder)} horas</strong> si no se recibe confirmación.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedOrder.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Notas</h4>
                      <p className="text-sm">{selectedOrder.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Historial de Logs</h4>
                  {!selectedOrder.logs || selectedOrder.logs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No hay logs para este pedido</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedOrder.logs.map((log) => {
                        const typeConf = logTypeConfig[log.type] || { label: log.type, color: 'bg-gray-100 text-gray-600' }
                        return (
                          <div key={log.id} className="border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeConf.color}`}>
                                {typeConf.label}
                              </span>
                              <span className="text-[10px] text-gray-400">{formatDate(log.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{log.message}</p>
                            {log.details && (
                              <details className="mt-1">
                                <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600">
                                  Ver detalles JSON
                                </summary>
                                <pre className="mt-1 text-[10px] text-gray-500 bg-gray-50 rounded p-2 overflow-x-auto max-h-40">
                                  {(() => {
                                    try {
                                      return JSON.stringify(JSON.parse(log.details), null, 2)
                                    } catch {
                                      return log.details
                                    }
                                  })()}
                                </pre>
                              </details>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
