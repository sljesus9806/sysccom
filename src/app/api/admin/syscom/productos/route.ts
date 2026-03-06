import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { buscarProductos } from '@/lib/syscom-api'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const categoria = searchParams.get('categoria') || undefined
  const marca = searchParams.get('marca') || undefined
  const busqueda = searchParams.get('busqueda') || undefined
  const pagina = parseInt(searchParams.get('pagina') || '1')

  if (!categoria && !marca && !busqueda) {
    return NextResponse.json(
      { error: 'Se requiere al menos un filtro: categoria, marca o busqueda' },
      { status: 400 }
    )
  }

  try {
    const result = await buscarProductos({ categoria, marca, busqueda, pagina })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al buscar productos'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
