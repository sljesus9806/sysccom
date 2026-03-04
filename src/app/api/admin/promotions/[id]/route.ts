import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const body = await request.json()

  const promotion = await prisma.promotion.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      type: body.type,
      value: body.value,
      code: body.code,
      minPurchase: body.minPurchase,
      maxUses: body.maxUses,
      isActive: body.isActive,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
  })

  return NextResponse.json(promotion)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  await prisma.promotion.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
