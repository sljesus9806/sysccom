import { prisma } from './prisma'

export async function verifyAdminToken(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      },
    },
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  if (!session.user.isActive) {
    return null
  }

  const adminRoles = ['ADMIN', 'MANAGER', 'OWNER']
  if (!adminRoles.includes(session.user.role)) {
    return null
  }

  return session.user
}

export function unauthorizedResponse() {
  return Response.json({ error: 'No autorizado' }, { status: 401 })
}
