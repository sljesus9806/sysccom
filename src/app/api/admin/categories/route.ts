import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Admin categories GET error:', error)
    return NextResponse.json({ error: 'Error al obtener categorias' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const body = await request.json()

    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json({ error: 'Nombre de categoria requerido (min 2 caracteres)' }, { status: 400 })
    }

    const slug = body.name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const existingSlug = await prisma.category.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'Ya existe una categoria con ese nombre' }, { status: 400 })
    }

    if (body.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: body.parentId } })
      if (!parent) {
        return NextResponse.json({ error: 'Categoria padre no encontrada' }, { status: 400 })
      }
    }

    const category = await prisma.category.create({
      data: {
        name: body.name.trim().slice(0, 100),
        slug,
        description: body.description?.trim() || null,
        icon: body.icon || null,
        image: body.image || null,
        parentId: body.parentId || null,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Admin categories POST error:', error)
    return NextResponse.json({ error: 'Error al crear categoria' }, { status: 500 })
  }
}
