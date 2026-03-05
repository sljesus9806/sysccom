import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 10 attempts per 15 minutes per IP
  const ip = getClientIp(request)
  const rl = checkRateLimit(`login:${ip}`, { maxAttempts: 10, windowMs: 15 * 60 * 1000 })
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        rfc: true,
        role: true,
        password: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!user) {
      return Response.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return Response.json(
        { error: 'Cuenta desactivada. Contacta a soporte.' },
        { status: 403 }
      )
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return Response.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    const session = await createSession(user.id)

    const { password: _, ...userWithoutPassword } = user

    return Response.json({
      user: userWithoutPassword,
      token: session.token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
