'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  X,
  UserCheck,
  UserX,
} from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
  _count: { sessions: number }
}

const roleLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OWNER: { label: 'Dueño', color: 'bg-amber-100 text-amber-700', icon: ShieldAlert },
  MANAGER: { label: 'Gerente', color: 'bg-blue-100 text-blue-700', icon: ShieldCheck },
  ADMIN: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Shield },
}

export default function UsuariosAdmin() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<{ role: string; id?: string } | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'ADMIN',
  })

  const token = () => localStorage.getItem('sysccom-admin-token')

  useEffect(() => {
    const stored = localStorage.getItem('sysccom-admin')
    if (stored) setCurrentUser(JSON.parse(stored))
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token()}` },
      })
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins)
      } else if (res.status === 403) {
        setError('No tienes permisos para ver esta sección')
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const method = editingUser ? 'PUT' : 'POST'
    const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'

    const body: Record<string, unknown> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || null,
      role: formData.role,
    }

    if (!editingUser) {
      body.email = formData.email
      body.password = formData.password
    }

    if (formData.password && editingUser) {
      body.password = formData.password
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      closeForm()
      fetchAdmins()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
    }
  }

  const toggleActive = async (admin: AdminUser) => {
    const res = await fetch(`/api/admin/users/${admin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ isActive: !admin.isActive }),
    })

    if (res.ok) {
      fetchAdmins()
    } else {
      const data = await res.json()
      alert(data.error || 'Error al cambiar estado')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este administrador? Se cerrarán todas sus sesiones.')) return

    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    })

    if (res.ok) {
      fetchAdmins()
    } else {
      const data = await res.json()
      alert(data.error || 'Error al eliminar')
    }
  }

  const openEdit = (admin: AdminUser) => {
    setEditingUser(admin)
    setFormData({
      email: admin.email,
      password: '',
      firstName: admin.firstName,
      lastName: admin.lastName,
      phone: admin.phone || '',
      role: admin.role,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingUser(null)
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'ADMIN' })
    setError('')
  }

  const isOwner = currentUser?.role === 'OWNER'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error && admins.length === 0) {
    return (
      <div className="text-center py-10">
        <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-red-400" />
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Usuarios Administradores</h2>
          <p className="text-sm text-gray-500">{admins.length} administradores registrados</p>
        </div>
        {isOwner && (
          <button
            onClick={() => {
              closeForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo Admin
          </button>
        )}
      </div>

      {/* Admin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map((admin) => {
          const roleInfo = roleLabels[admin.role] || roleLabels.ADMIN
          const RoleIcon = roleInfo.icon
          return (
            <div
              key={admin.id}
              className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                !admin.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold">
                    {admin.firstName[0]}{admin.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {admin.firstName} {admin.lastName}
                    </h3>
                    <p className="text-xs text-gray-400">{admin.email}</p>
                  </div>
                </div>
                {isOwner && admin.role !== 'OWNER' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(admin)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                  <RoleIcon className="w-3 h-3" />
                  {roleInfo.label}
                </span>
                <button
                  onClick={() => toggleActive(admin)}
                  disabled={admin.role === 'OWNER'}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    admin.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  } ${admin.role === 'OWNER' ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                >
                  {admin.isActive ? (
                    <><UserCheck className="w-3 h-3" /> Activo</>
                  ) : (
                    <><UserX className="w-3 h-3" /> Inactivo</>
                  )}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Registrado: {new Date(admin.createdAt).toLocaleDateString('es-MX')}
                </span>
                {admin.phone && (
                  <span className="text-xs text-gray-400">{admin.phone}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Editar Administrador' : 'Nuevo Administrador'}
              </h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  required={!editingUser}
                  minLength={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Gerente</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Administrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
