import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const { id, imageId } = await params

    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId: id },
    })

    if (!image) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
    }

    // Delete file from disk if it's a local upload
    if (image.url.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', image.url)
      try {
        await unlink(filePath)
      } catch {
        // File may not exist, continue with DB deletion
      }
    }

    await prisma.productImage.delete({ where: { id: imageId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Image delete error:', error)
    return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 })
  }
}
