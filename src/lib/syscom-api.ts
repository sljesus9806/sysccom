import { prisma } from './prisma'

const SYSCOM_TOKEN_URL = 'https://developers.syscom.mx/oauth/token'
const SYSCOM_API_BASE = 'https://developers.syscom.mx/api/v1'

interface SyscomToken {
  access_token: string
  token_type: string
  expires_in: number
}

async function getAccessToken(): Promise<string> {
  const config = await prisma.syscomConfig.findFirst({
    where: { isActive: true },
  })

  if (!config) {
    throw new Error('No hay credenciales de SYSCOM configuradas')
  }

  // Return cached token if still valid (with 60s buffer)
  if (config.accessToken && config.tokenExpiry && config.tokenExpiry > new Date(Date.now() + 60_000)) {
    return config.accessToken
  }

  // Request new token via OAuth2 client credentials
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'client_credentials',
  })

  const res = await fetch(SYSCOM_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error al obtener token de SYSCOM: ${res.status} ${text}`)
  }

  const data: SyscomToken = await res.json()

  // Cache the token
  await prisma.syscomConfig.update({
    where: { id: config.id },
    data: {
      accessToken: data.access_token,
      tokenExpiry: new Date(Date.now() + data.expires_in * 1000),
    },
  })

  return data.access_token
}

async function syscomFetch(path: string, params?: Record<string, string>) {
  const token = await getAccessToken()
  const url = new URL(`${SYSCOM_API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SYSCOM API error ${res.status}: ${text}`)
  }

  return res.json()
}

// ============================================================
// Categorías
// ============================================================

export interface SyscomCategoria {
  id: string
  nombre: string
  nivel: number
}

export interface SyscomCategoriaDetalle extends SyscomCategoria {
  origen?: SyscomCategoria[]
  subcategorias?: SyscomCategoria[]
}

export async function getCategorias(): Promise<SyscomCategoria[]> {
  return syscomFetch('/categorias')
}

export async function getCategoria(id: string): Promise<SyscomCategoriaDetalle> {
  return syscomFetch(`/categorias/${id}`)
}

// ============================================================
// Productos
// ============================================================

export interface SyscomProducto {
  producto_id: number
  modelo: string
  total_existencia: number
  titulo: string
  marca: string
  sat_key: string
  img_portada: string
  categorias: { id: number; nombre: string }[]
  marca_logo: string
  link: string
  precios: {
    precio_especial: string
    precio_descuento: string
    precio_lista: string
  }
}

export interface SyscomProductoDetalle extends SyscomProducto {
  descripcion?: string
  imagenes?: { orden: number; url?: string; imagen?: string }[]
  caracteristicas?: string[]
  recursos?: { recurso: string; path: string }[]
  existencia?: Record<string, unknown>
}

export interface SyscomBusqueda {
  cantidad: number
  pagina: number
  paginas: number
  productos: SyscomProducto[]
}

export async function buscarProductos(opts: {
  categoria?: string
  marca?: string
  busqueda?: string
  pagina?: number
  stock?: boolean
}): Promise<SyscomBusqueda> {
  const params: Record<string, string> = {}
  if (opts.categoria) params.categoria = opts.categoria
  if (opts.marca) params.marca = opts.marca
  if (opts.busqueda) params.busqueda = opts.busqueda
  if (opts.pagina) params.pagina = String(opts.pagina)
  if (opts.stock) params.stock = '1'
  return syscomFetch('/productos', params)
}

export async function getProducto(id: string): Promise<SyscomProductoDetalle> {
  return syscomFetch(`/productos/${id}`)
}

// ============================================================
// Tipo de Cambio
// ============================================================

export interface SyscomTipoCambio {
  normal: string
  un_dia: string
  una_semana: string
  dos_semanas: string
  tres_semanas: string
  un_mes: string
}

export async function getTipoCambio(): Promise<SyscomTipoCambio> {
  return syscomFetch('/tipocambio')
}

// ============================================================
// Validar credenciales
// ============================================================

export async function validarCredenciales(clientId: string, clientSecret: string): Promise<boolean> {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  })

  const res = await fetch(SYSCOM_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  return res.ok
}
