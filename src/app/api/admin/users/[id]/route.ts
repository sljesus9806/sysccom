import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Solo el dueño puede editar administradores' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  const data: Record<string, unknown> = {
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone || null,
    role: body.role,
  }

  if (body.password) {
    data.password = crypto.createHash('sha256').update(body.password).digest('hex')
  }

  const admin = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  })

  return NextResponse.json(admin)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  if (id === user.id) {
    return NextResponse.json({ error: 'No puedes desactivarte a ti mismo' }, { status: 400 })
  }

  const admin = await prisma.user.update({
    where: { id },
    data: { isActive: body.isActive },
    select: { id: true, isActive: true },
  })

  return NextResponse.json(admin)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Solo el dueño puede eliminar administradores' }, { status: 403 })
  }

  const { id } = await params

  if (id === user.id) {
    return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
  }

  await prisma.session.deleteMany({ where: { userId: id } })
  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
