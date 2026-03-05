import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, company, rfc } = body

    if (!email || !password || !firstName || !lastName) {
      return Response.json(
        { error: 'Email, contraseña, nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return Response.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        company: company || null,
        rfc: rfc || null,
        role: 'CUSTOMER',
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

    const session = await createSession(user.id)

    return Response.json({
      user,
      token: session.token,
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return Response.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    )
  }
}
