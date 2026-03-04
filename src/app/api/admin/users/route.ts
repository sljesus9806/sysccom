import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER', 'OWNER'] } },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ admins })
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Solo el dueño puede crear administradores' }, { status: 403 })
  }

  const body = await request.json()

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 400 })
  }

  const hashedPassword = crypto.createHash('sha256').update(body.password).digest('hex')

  const admin = await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || null,
      role: body.role || 'ADMIN',
      emailVerified: true,
      isActive: true,
    },
  })

  return NextResponse.json(
    { id: admin.id, email: admin.email, firstName: admin.firstName, lastName: admin.lastName, role: admin.role },
    { status: 201 }
  )
}
