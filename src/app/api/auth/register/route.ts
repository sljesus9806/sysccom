import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSession } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per 30 minutes per IP
  const ip = getClientIp(request)
  const rl = checkRateLimit(`register:${ip}`, { maxAttempts: 5, windowMs: 30 * 60 * 1000 })
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, company, rfc } = body

    if (!email || !password || !firstName || !lastName) {
      return Response.json(
        { error: 'Email, contrasena, nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return Response.json(
        { error: 'La contrasena debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return Response.json(
        { error: 'La contrasena debe incluir al menos una mayuscula y un numero' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(cleanEmail)) {
      return Response.json(
        { error: 'Email invalido' },
        { status: 400 }
      )
    }

    const sanitize = (s: string) => s.trim().slice(0, 100)
    const cleanFirstName = sanitize(firstName)
    const cleanLastName = sanitize(lastName)

    if (cleanFirstName.length < 2 || cleanLastName.length < 2) {
      return Response.json(
        { error: 'Nombre y apellido deben tener al menos 2 caracteres' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
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
        email: cleanEmail,
        password: hashedPassword,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        phone: phone ? sanitize(phone) : null,
        company: company ? sanitize(company) : null,
        rfc: rfc ? sanitize(rfc).toUpperCase() : null,
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

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.firstName).catch((err) => {
      console.error('Failed to send welcome email:', err)
    })

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
