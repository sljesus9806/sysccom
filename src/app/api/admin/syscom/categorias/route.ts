import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { getCategorias } from '@/lib/syscom-api'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const categorias = await getCategorias()
    return NextResponse.json(categorias)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener categorías'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
