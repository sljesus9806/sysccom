import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.promotion.count(),
    ])

    return NextResponse.json({
      promotions: promotions.map((p) => ({
        ...p,
        value: Number(p.value),
        minPurchase: p.minPurchase ? Number(p.minPurchase) : null,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Admin promotions GET error:', error)
    return NextResponse.json({ error: 'Error al obtener promociones' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const body = await request.json()

    if (!body.name || !body.type || body.value === undefined || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'Nombre, tipo, valor, fecha inicio y fecha fin son requeridos' }, { status: 400 })
    }

    const validTypes = ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: 'Tipo de promocion invalido' }, { status: 400 })
    }

    if (body.code) {
      const existing = await prisma.promotion.findUnique({ where: { code: body.code.toUpperCase() } })
      if (existing) {
        return NextResponse.json({ error: 'Ya existe una promocion con ese codigo' }, { status: 400 })
      }
    }

    const promotion = await prisma.promotion.create({
      data: {
        name: body.name.trim().slice(0, 200),
        description: body.description?.trim() || null,
        type: body.type,
        value: body.value,
        code: body.code?.toUpperCase().trim() || null,
        minPurchase: body.minPurchase || null,
        maxUses: body.maxUses || null,
        isActive: body.isActive ?? true,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
    })

    return NextResponse.json(promotion, { status: 201 })
  } catch (error) {
    console.error('Admin promotions POST error:', error)
    return NextResponse.json({ error: 'Error al crear promocion' }, { status: 500 })
  }
}
