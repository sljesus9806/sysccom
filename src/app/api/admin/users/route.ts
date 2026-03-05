import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  try {
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
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Solo el dueño puede crear administradores' }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json({ error: 'Email, contrasena, nombre y apellido son requeridos' }, { status: 400 })
    }

    if (body.password.length < 8) {
      return NextResponse.json({ error: 'La contrasena debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const validRoles = ['ADMIN', 'MANAGER']
    if (body.role && !validRoles.includes(body.role)) {
      return NextResponse.json({ error: 'Rol invalido' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email.trim().toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(body.password)

    const admin = await prisma.user.create({
      data: {
        email: body.email.trim().toLowerCase(),
        password: hashedPassword,
        firstName: body.firstName.trim().slice(0, 100),
        lastName: body.lastName.trim().slice(0, 100),
        phone: body.phone?.trim() || null,
        role: body.role || 'ADMIN',
        emailVerified: true,
        isActive: true,
      },
    })

    return NextResponse.json(
      { id: admin.id, email: admin.email, firstName: admin.firstName, lastName: admin.lastName, role: admin.role },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin users POST error:', error)
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
