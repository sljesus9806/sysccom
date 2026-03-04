'use client'

import { useState, useEffect } from 'react'
import { Plus, Tag, Edit2, Trash2, X, Calendar, Percent, DollarSign, Truck } from 'lucide-react'

interface Promotion {
  id: string
  name: string
  description: string | null
  type: string
  value: number
  code: string | null
  minPurchase: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  startDate: string
  endDate: string
}

const typeLabels: Record<string, { label: string; icon: React.ElementType }> = {
  PERCENTAGE: { label: 'Porcentaje', icon: Percent },
  FIXED: { label: 'Monto fijo', icon: DollarSign },
  FREE_SHIPPING: { label: 'Envío gratis', icon: Truck },
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PromocionesAdmin() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    code: '',
    minPurchase: '',
    maxUses: '',
    isActive: true,
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem('sysccom-admin-token')
      const res = await fetch('/api/admin/promotions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setPromotions(await res.json())
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('sysccom-admin-token')
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/admin/promotions/${editing.id}` : '/api/admin/promotions'

    const body = {
      ...formData,
      value: parseFloat(formData.value),
      minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      code: formData.code || null,
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setShowForm(false)
      setEditing(null)
      resetForm()
      fetchPromotions()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta promoción?')) return
    const token = localStorage.getItem('sysccom-admin-token')
    await fetch(`/api/admin/promotions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchPromotions()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      code: '',
      minPurchase: '',
      maxUses: '',
      isActive: true,
      startDate: '',
      endDate: '',
    })
  }

  const openEdit = (promo: Promotion) => {
    setEditing(promo)
    setFormData({
      name: promo.name,
      description: promo.description || '',
      type: promo.type,
      value: String(promo.value),
      code: promo.code || '',
      minPurchase: promo.minPurchase ? String(promo.minPurchase) : '',
      maxUses: promo.maxUses ? String(promo.maxUses) : '',
      isActive: promo.isActive,
      startDate: promo.startDate.split('T')[0],
      endDate: promo.endDate.split('T')[0],
    })
    setShowForm(true)
  }

  const isExpired = (endDate: string) => new Date(endDate) < new Date()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Promociones</h2>
        <button
          onClick={() => {
            resetForm()
            setEditing(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nueva Promoción
        </button>
      </div>

      {/* Promotions list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-400">Cargando...</div>
        ) : promotions.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-400">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No hay promociones
          </div>
        ) : (
          promotions.map((promo) => {
            const typeInfo = typeLabels[promo.type] || typeLabels.PERCENTAGE
            const TypeIcon = typeInfo.icon
            const expired = isExpired(promo.endDate)
            return (
              <div
                key={promo.id}
                className={`bg-white rounded-xl border p-5 ${
                  expired ? 'border-gray-200 opacity-60' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{promo.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          promo.isActive && !expired
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {expired ? 'Expirada' : promo.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                        <span className="text-xs text-gray-400">{typeInfo.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(promo)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(promo.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {promo.description && (
                  <p className="text-sm text-gray-500 mt-3">{promo.description}</p>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs">Valor</span>
                    <p className="font-semibold">
                      {promo.type === 'PERCENTAGE' ? `${promo.value}%` : promo.type === 'FIXED' ? formatPrice(promo.value) : 'Envío gratis'}
                    </p>
                  </div>
                  {promo.code && (
                    <div>
                      <span className="text-gray-400 text-xs">Código</span>
                      <p className="font-mono font-semibold text-primary-600">{promo.code}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-xs">Vigencia</span>
                    <p className="text-xs">{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Usos</span>
                    <p>{promo.usedCount}{promo.maxUses ? ` / ${promo.maxUses}` : ''}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">{editing ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Monto fijo ($)</option>
                    <option value="FREE_SHIPPING">Envío gratis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código cupón</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Ej: VERANO20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compra mínima</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Ilimitado"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-primary-600"
                    />
                    Activa
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null) }}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
