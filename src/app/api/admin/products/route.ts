import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        images: { select: { url: true }, take: 1, orderBy: { position: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    })),
    total,
  })
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const body = await request.json()
  const slug = body.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      sku: body.sku,
      description: body.description || '',
      price: body.price,
      originalPrice: body.originalPrice,
      stock: body.stock,
      categoryId: body.categoryId,
      brandId: body.brandId,
      featured: body.featured || false,
      isNew: body.isNew || false,
      isActive: body.isActive ?? true,
      images: body.imageUrls?.length
        ? {
            create: body.imageUrls.map((url: string, i: number) => ({
              url,
              alt: body.name,
              position: i,
            })),
          }
        : undefined,
    },
    include: { images: true },
  })

  return NextResponse.json(product, { status: 201 })
}
