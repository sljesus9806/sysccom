import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const { id } = await params
    const body = await request.json()

    if (!body.name || !body.sku || !body.description || body.price === undefined) {
      return NextResponse.json({ error: 'Nombre, SKU, descripcion y precio son requeridos' }, { status: 400 })
    }

    const slug = body.name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name.trim(),
        slug,
        sku: body.sku.trim(),
        description: body.description.trim(),
        price: body.price,
        originalPrice: body.originalPrice ?? null,
        stock: body.stock ?? 0,
        categoryId: body.categoryId,
        brandId: body.brandId,
        featured: body.featured ?? false,
        isNew: body.isNew ?? false,
        isActive: body.isActive ?? true,
      },
      include: { images: { orderBy: { position: 'asc' } } },
    })

    // Add new images if provided
    if (body.imageUrls?.length) {
      const lastImage = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { position: 'desc' },
      })
      let position = (lastImage?.position ?? -1) + 1
      for (const url of body.imageUrls) {
        await prisma.productImage.create({
          data: { productId: id, url, alt: body.name.trim(), position },
        })
        position++
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Admin product PUT error:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

const ALLOWED_PATCH_FIELDS = new Set([
  'name', 'description', 'price', 'originalPrice', 'stock',
  'featured', 'isNew', 'isActive', 'discount', 'categoryId', 'brandId',
])

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const { id } = await params
    const body = await request.json()

    // Filter to only allowed fields
    const data: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_PATCH_FIELDS.has(key)) {
        data[key] = value
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron campos validos para actualizar' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Admin product PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin product DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
