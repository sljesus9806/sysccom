'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Users,
  Mail,
  Phone,
  Building2,
  ShoppingCart,
  Eye,
  X,
  UserCheck,
  UserX,
} from 'lucide-react'

interface Client {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  company: string | null
  rfc: string | null
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  _count: { orders: number }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ClientesAdmin() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  useEffect(() => {
    fetchClients()
  }, [search])

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('sysccom-admin-token')
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/clients?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (client: Client) => {
    const token = localStorage.getItem('sysccom-admin-token')
    await fetch(`/api/admin/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !client.isActive }),
    })
    fetchClients()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Clientes</h2>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, correo o empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {/* Clients grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-400">Cargando...</div>
        ) : clients.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No se encontraron clientes
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                    {client.firstName[0]}{client.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-gray-400">Desde {formatDate(client.createdAt)}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    client.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {client.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{client.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-gray-400" />
                  <span>{client._count.orders} pedidos</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => toggleActive(client)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    client.isActive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {client.isActive ? (
                    <>
                      <UserX className="w-3.5 h-3.5" /> Desactivar
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" /> Activar
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedClient(client)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver Detalle
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Detalle del Cliente</h3>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold">
                  {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedClient.firstName} {selectedClient.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Teléfono</span>
                  <p className="font-medium">{selectedClient.phone || 'No registrado'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Empresa</span>
                  <p className="font-medium">{selectedClient.company || 'No registrada'}</p>
                </div>
                <div>
                  <span className="text-gray-500">RFC</span>
                  <p className="font-medium">{selectedClient.rfc || 'No registrado'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Pedidos</span>
                  <p className="font-medium">{selectedClient._count.orders}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email verificado</span>
                  <p className="font-medium">{selectedClient.emailVerified ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Registro</span>
                  <p className="font-medium">{formatDate(selectedClient.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
