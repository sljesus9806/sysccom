'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Key,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Search,
  Loader2,
  FolderTree,
  Package,
  ExternalLink,
} from 'lucide-react'

function getToken() {
  return localStorage.getItem('sysccom-admin-token') || ''
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }
}

// ============================================================
// Types
// ============================================================

interface SyscomConfig {
  configured: boolean
  clientId?: string
  clientSecretHint?: string
  hasValidToken?: boolean
  updatedAt?: string
}

interface Categoria {
  id: string
  nombre: string
  nivel: number
}

interface CategoriaDetalle extends Categoria {
  origen?: Categoria[]
  subcategorias?: Categoria[]
}

interface SyscomProducto {
  producto_id: number
  modelo: string
  total_existencia: number
  titulo: string
  marca: string
  img_portada: string
  precios: {
    precio_especial: string
    precio_descuento: string
    precio_lista: string
  }
}

interface Busqueda {
  cantidad: number
  pagina: number
  paginas: number
  productos: SyscomProducto[]
}

// ============================================================
// Main Component
// ============================================================

export default function SyscomPage() {
  const [tab, setTab] = useState<'config' | 'categorias' | 'productos'>('config')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Integración SYSCOM</h1>
        <p className="text-sm text-slate-500 mt-1">
          Conecta tu cuenta de SYSCOM para importar productos directamente a tu tienda
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'config' as const, label: 'Credenciales', icon: Key },
          { id: 'categorias' as const, label: 'Categorías', icon: FolderTree },
          { id: 'productos' as const, label: 'Productos', icon: Package },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'config' && <ConfigSection onConfigured={() => setTab('categorias')} />}
      {tab === 'categorias' && <CategoriasSection />}
      {tab === 'productos' && <ProductosSection />}
    </div>
  )
}

// ============================================================
// Config Section
// ============================================================

function ConfigSection({ onConfigured }: { onConfigured: () => void }) {
  const [config, setConfig] = useState<SyscomConfig | null>(null)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/syscom/config', { headers: authHeaders() })
      .then((r) => r.json())
      .then(setConfig)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/syscom/config', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ clientId, clientSecret }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error })
      } else {
        setMessage({ type: 'success', text: data.message })
        setConfig({ configured: true, clientId, clientSecretHint: clientSecret.slice(0, 4) + '••••••••', hasValidToken: true })
        setClientId('')
        setClientSecret('')
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">Credenciales API de SYSCOM</h2>
      <p className="text-sm text-slate-500 mb-6">
        Obtén tus credenciales en{' '}
        <a
          href="https://developers.syscom.mx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          developers.syscom.mx <ExternalLink className="w-3 h-3" />
        </a>
      </p>

      {/* Status actual */}
      {config?.configured && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <Check className="w-4 h-4" />
            Credenciales configuradas
          </div>
          <div className="mt-2 text-xs text-green-600 space-y-1">
            <p>Client ID: {config.clientId}</p>
            <p>Client Secret: {config.clientSecretHint}</p>
            <p>Token válido: {config.hasValidToken ? 'Sí' : 'No (se renovará automáticamente)'}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Tu client_id de SYSCOM"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Client Secret</label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Tu client_secret de SYSCOM"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !clientId || !clientSecret}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {saving ? 'Validando...' : config?.configured ? 'Actualizar Credenciales' : 'Guardar Credenciales'}
          </button>
          {config?.configured && (
            <button
              onClick={onConfigured}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Ir a Categorías
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Categorías Section
// ============================================================

function CategoriasSection() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [detalle, setDetalle] = useState<CategoriaDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [error, setError] = useState('')
  const [breadcrumb, setBreadcrumb] = useState<Categoria[]>([])

  const fetchCategorias = useCallback(() => {
    setLoading(true)
    setError('')
    fetch('/api/admin/syscom/categorias', { headers: authHeaders() })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error)
        return r.json()
      })
      .then((data) => {
        setCategorias(data)
        setDetalle(null)
        setBreadcrumb([])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchCategorias()
  }, [fetchCategorias])

  const openCategoria = async (cat: Categoria) => {
    setLoadingDetalle(true)
    try {
      const res = await fetch(`/api/admin/syscom/categorias/${cat.id}`, { headers: authHeaders() })
      if (!res.ok) throw new Error((await res.json()).error)
      const data: CategoriaDetalle = await res.json()
      setDetalle(data)
      setBreadcrumb((prev) => [...prev, cat])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoadingDetalle(false)
    }
  }

  const goBack = () => {
    if (breadcrumb.length <= 1) {
      setDetalle(null)
      setBreadcrumb([])
    } else {
      const prev = breadcrumb.slice(0, -1)
      setBreadcrumb(prev)
      openCategoria(prev[prev.length - 1])
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={fetchCategorias}
          className="mt-3 text-sm text-red-600 hover:underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {detalle && (
            <button onClick={goBack} className="text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="font-semibold text-slate-800">
              {detalle ? detalle.nombre : 'Categorías Base de SYSCOM'}
            </h2>
            {breadcrumb.length > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                {breadcrumb.map((b) => b.nombre).join(' → ')}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={fetchCategorias}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Recargar
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loadingDetalle ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(detalle?.subcategorias || categorias).map((cat) => (
              <button
                key={cat.id}
                onClick={() => openCategoria(cat)}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left group"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                    {cat.nombre}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">ID: {cat.id} • Nivel {cat.nivel}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
              </button>
            ))}
          </div>
        )}

        {detalle && (!detalle.subcategorias || detalle.subcategorias.length === 0) && (
          <p className="text-center text-sm text-slate-400 py-6">
            Esta categoría no tiene subcategorías
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Productos Section
// ============================================================

function ProductosSection() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [resultado, setResultado] = useState<Busqueda | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importResult, setImportResult] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    fetch('/api/admin/syscom/categorias', { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategorias(data)
      })
      .catch(() => {})
  }, [])

  const buscar = async (pagina = 1) => {
    if (!busqueda && !categoriaId) return
    setLoading(true)
    setError('')
    setImportResult(null)
    try {
      const params = new URLSearchParams()
      if (busqueda) params.set('busqueda', busqueda.replace(/\s+/g, '+'))
      if (categoriaId) params.set('categoria', categoriaId)
      params.set('pagina', String(pagina))

      const res = await fetch(`/api/admin/syscom/productos?${params}`, { headers: authHeaders() })
      if (!res.ok) throw new Error((await res.json()).error)
      const data: Busqueda = await res.json()
      setResultado(data)
      setSelected(new Set())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (!resultado) return
    if (selected.size === resultado.productos.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(resultado.productos.map((p) => p.producto_id)))
    }
  }

  const importSelected = async () => {
    if (selected.size === 0) return
    setImporting(true)
    setImportResult(null)
    try {
      const res = await fetch('/api/admin/syscom/productos/importar', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productoIds: Array.from(selected) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImportResult(data.message)
      setSelected(new Set())
    } catch (e) {
      setImportResult(e instanceof Error ? e.message : 'Error al importar')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Buscar por texto</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscar()}
                placeholder="Buscar productos en SYSCOM..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <label className="block text-xs font-medium text-slate-500 mb-1">Filtrar por categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => buscar()}
              disabled={loading || (!busqueda && !categoriaId)}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Buscar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {importResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {importResult}
        </div>
      )}

      {/* Results */}
      {resultado && (
        <div className="bg-white rounded-xl border border-slate-200">
          {/* Results header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">{resultado.cantidad}</span> productos encontrados
                {resultado.paginas > 1 && ` • Página ${resultado.pagina} de ${resultado.paginas}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={selectAll}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {selected.size === resultado.productos.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
              {selected.size > 0 && (
                <button
                  onClick={importSelected}
                  disabled={importing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {importing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Importar {selected.size} producto{selected.size !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          {/* Product list */}
          <div className="divide-y divide-slate-100">
            {resultado.productos.map((p) => (
              <div
                key={p.producto_id}
                className={`flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                  selected.has(p.producto_id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => toggleSelect(p.producto_id)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.producto_id)}
                  onChange={() => toggleSelect(p.producto_id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                  {p.img_portada ? (
                    <img src={p.img_portada} alt={p.titulo} className="w-full h-full object-contain" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.titulo}</p>
                  <p className="text-xs text-slate-400">
                    {p.marca} • SKU: {p.modelo} • Stock: {p.total_existencia}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-800">
                    ${parseFloat(p.precios.precio_descuento || p.precios.precio_lista).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  {p.precios.precio_lista !== p.precios.precio_descuento && (
                    <p className="text-xs text-slate-400 line-through">
                      ${parseFloat(p.precios.precio_lista).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {resultado.paginas > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-center gap-2">
              <button
                onClick={() => buscar(resultado.pagina - 1)}
                disabled={resultado.pagina <= 1 || loading}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-500">
                Página {resultado.pagina} de {resultado.paginas}
              </span>
              <button
                onClick={() => buscar(resultado.pagina + 1)}
                disabled={resultado.pagina >= resultado.paginas || loading}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {!resultado && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            Busca productos por nombre o filtra por categoría para ver el catálogo de SYSCOM
          </p>
        </div>
      )}
    </div>
  )
}
