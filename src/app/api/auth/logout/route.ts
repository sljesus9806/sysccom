import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      await prisma.session.deleteMany({ where: { token } })
    }

    return Response.json({ message: 'Sesión cerrada' })
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json({ message: 'Sesión cerrada' })
  }
}
