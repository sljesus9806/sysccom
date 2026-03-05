import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
