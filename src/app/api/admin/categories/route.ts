import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const categories = await prisma.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(categories)
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

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug,
      description: body.description || null,
      icon: body.icon || null,
      image: body.image || null,
      parentId: body.parentId || null,
    },
  })

  return NextResponse.json(category, { status: 201 })
}
