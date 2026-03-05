import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await verifyToken(request)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  return Response.json({ user })
}

export async function PUT(request: Request) {
  const user = await verifyToken(request)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { firstName, lastName, phone, company, rfc } = body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(rfc !== undefined && { rfc }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        rfc: true,
        role: true,
        createdAt: true,
      },
    })

    return Response.json({ user: updatedUser })
  } catch (error) {
    console.error('Update profile error:', error)
    return Response.json({ error: 'Error al actualizar perfil' }, { status: 500 })
  }
}
