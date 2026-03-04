import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const banners = await prisma.banner.findMany({
    orderBy: { position: 'asc' },
  })

  return NextResponse.json(banners)
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const body = await request.json()

  const banner = await prisma.banner.create({
    data: {
      title: body.title,
      subtitle: body.subtitle,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl,
      position: body.position || 0,
      isActive: body.isActive ?? true,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  })

  return NextResponse.json(banner, { status: 201 })
}
