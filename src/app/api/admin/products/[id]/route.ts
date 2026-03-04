import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const body = await request.json()

  const slug = body.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug,
      sku: body.sku,
      description: body.description,
      price: body.price,
      originalPrice: body.originalPrice,
      stock: body.stock,
      categoryId: body.categoryId,
      brandId: body.brandId,
      featured: body.featured,
      isNew: body.isNew,
      isActive: body.isActive,
    },
  })

  return NextResponse.json(product)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const body = await request.json()

  const product = await prisma.product.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(product)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params

  await prisma.product.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
