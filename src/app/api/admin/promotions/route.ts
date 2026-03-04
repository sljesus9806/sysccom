import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    promotions.map((p) => ({
      ...p,
      value: Number(p.value),
      minPurchase: p.minPurchase ? Number(p.minPurchase) : null,
    }))
  )
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const body = await request.json()

  const promotion = await prisma.promotion.create({
    data: {
      name: body.name,
      description: body.description,
      type: body.type,
      value: body.value,
      code: body.code,
      minPurchase: body.minPurchase,
      maxUses: body.maxUses,
      isActive: body.isActive ?? true,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
  })

  return NextResponse.json(promotion, { status: 201 })
}
