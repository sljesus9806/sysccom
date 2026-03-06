import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { getCategoria } from '@/lib/syscom-api'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const { id } = await params
    const categoria = await getCategoria(id)
    return NextResponse.json(categoria)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener categoría'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
