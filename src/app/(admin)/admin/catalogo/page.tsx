'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Tag,
  X,
  Package,
  ChevronRight,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  image: string | null
  parentId: string | null
  parent: { id: string; name: string } | null
  _count: { products: number; children: number }
}

interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  _count: { products: number }
}

export default function CatalogoAdmin() {
  const [tab, setTab] = useState<'categories' | 'brands'>('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Category | Brand | null>(null)
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '', image: '', parentId: '' })
  const [brandForm, setBrandForm] = useState({ name: '', logo: '' })
  const [error, setError] = useState('')

  const token = () => localStorage.getItem('sysccom-admin-token')
  const headers = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token()}` } }),
        fetch('/api/admin/brands', { headers: { Authorization: `Bearer ${token()}` } }),
      ])
      if (catRes.ok) setCategories(await catRes.json())
      if (brandRes.ok) setBrands(await brandRes.json())
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const method = editingItem ? 'PUT' : 'POST'
    const url = editingItem ? `/api/admin/categories/${editingItem.id}` : '/api/admin/categories'

    const res = await fetch(url, {
      method,
      headers: headers(),
      body: JSON.stringify({
        name: catForm.name,
        description: catForm.description || null,
        icon: catForm.icon || null,
        image: catForm.image || null,
        parentId: catForm.parentId || null,
      }),
    })

    if (res.ok) {
      closeForm()
      fetchData()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
    }
  }

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const method = editingItem ? 'PUT' : 'POST'
    const url = editingItem ? `/api/admin/brands/${editingItem.id}` : '/api/admin/brands'

    const res = await fetch(url, {
      method,
      headers: headers(),
      body: JSON.stringify({ name: brandForm.name, logo: brandForm.logo || null }),
    })

    if (res.ok) {
      closeForm()
      fetchData()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
    }
  }

  const handleDelete = async (type: 'categories' | 'brands', id: string) => {
    const label = type === 'categories' ? 'categoría' : 'marca'
    if (!confirm(`¿Estás seguro de eliminar esta ${label}?`)) return

    const res = await fetch(`/api/admin/${type}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    })

    if (res.ok) {
      fetchData()
    } else {
      const data = await res.json()
      alert(data.error || 'Error al eliminar')
    }
  }

  const openEditCategory = (cat: Category) => {
    setEditingItem(cat)
    setCatForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '',
      image: cat.image || '',
      parentId: cat.parentId || '',
    })
    setShowForm(true)
  }

  const openEditBrand = (brand: Brand) => {
    setEditingItem(brand)
    setBrandForm({ name: brand.name, logo: brand.logo || '' })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setCatForm({ name: '', description: '', icon: '', image: '', parentId: '' })
    setBrandForm({ name: '', logo: '' })
    setError('')
  }

  const parentCategories = categories.filter((c) => !c.parentId)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Catálogo</h2>
          <p className="text-sm text-gray-500">
            {categories.length} categorías · {brands.length} marcas
          </p>
        </div>
        <button
          onClick={() => {
            closeForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {tab === 'categories' ? 'Nueva Categoría' : 'Nueva Marca'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'categories' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Categorías
        </button>
        <button
          onClick={() => setTab('brands')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'brands' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          Marcas
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : tab === 'categories' ? (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400">
              <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No hay categorías registradas
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FolderTree className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{cat.name}</h3>
                      {cat.parent && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" />
                          {cat.parent.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCategory(cat)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete('categories', cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {cat.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{cat.description}</p>
                )}
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Package className="w-3 h-3" />
                    {cat._count.products} productos
                  </span>
                  {cat._count.children > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <FolderTree className="w-3 h-3" />
                      {cat._count.children} subcategorías
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Brands Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400">
              <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No hay marcas registradas
            </div>
          ) : (
            brands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center overflow-hidden">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                      ) : (
                        <Tag className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{brand.name}</h3>
                      <p className="text-xs text-gray-400">/{brand.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditBrand(brand)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete('brands', brand.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Package className="w-3 h-3" />
                    {brand._count.products} productos
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingItem
                  ? `Editar ${tab === 'categories' ? 'Categoría' : 'Marca'}`
                  : `Nueva ${tab === 'categories' ? 'Categoría' : 'Marca'}`}
              </h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {tab === 'categories' ? (
              <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Padre</label>
                  <select
                    value={catForm.parentId}
                    onChange={(e) => setCatForm({ ...catForm, parentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Ninguna (raíz)</option>
                    {parentCategories
                      .filter((c) => c.id !== editingItem?.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icono (URL)</label>
                    <input
                      type="text"
                      value={catForm.icon}
                      onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (URL)</label>
                    <input
                      type="text"
                      value={catForm.image}
                      onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Opcional"
                    />
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
                    {editingItem ? 'Guardar Cambios' : 'Crear Categoría'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveBrand} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo (URL)</label>
                  <input
                    type="text"
                    value={brandForm.logo}
                    onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Opcional"
                  />
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
                    {editingItem ? 'Guardar Cambios' : 'Crear Marca'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
