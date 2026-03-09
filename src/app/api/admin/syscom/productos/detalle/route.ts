import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { getProducto } from '@/lib/syscom-api'

/** Returns the raw SYSCOM API response for a product, useful for debugging image fields */
export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Se requiere el parámetro id' }, { status: 400 })
  }

  try {
    const producto = await getProducto(id)

    // Extract image-related fields for easy inspection
    const imageFields: Record<string, unknown> = {}
    for (const key of Object.keys(producto as Record<string, unknown>)) {
      if (/img|image|foto|imagen|recurso|photo/i.test(key)) {
        imageFields[key] = (producto as Record<string, unknown>)[key]
      }
    }

    return NextResponse.json({
      producto_id: producto.producto_id,
      modelo: producto.modelo,
      titulo: producto.titulo,
      imageFields,
      fullResponse: producto,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener producto'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
