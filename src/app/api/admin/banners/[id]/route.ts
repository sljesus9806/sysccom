import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const body = await request.json()

  const banner = await prisma.banner.update({
    where: { id },
    data: {
      title: body.title,
      subtitle: body.subtitle,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl,
      position: body.position,
      isActive: body.isActive,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  })

  return NextResponse.json(banner)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const body = await request.json()

  const banner = await prisma.banner.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(banner)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  await prisma.banner.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
