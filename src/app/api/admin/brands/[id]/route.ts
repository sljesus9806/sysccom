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

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      name: body.name,
      slug,
      logo: body.logo || null,
    },
  })

  return NextResponse.json(brand)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params

  const productsCount = await prisma.product.count({ where: { brandId: id } })
  if (productsCount > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${productsCount} productos asociados` },
      { status: 400 }
    )
  }

  await prisma.brand.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
