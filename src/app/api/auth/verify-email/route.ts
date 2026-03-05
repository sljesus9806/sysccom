import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { sendEmailVerification } from '@/lib/email'
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rate-limit'

// POST: Send verification email
export async function POST(request: NextRequest) {
  // Rate limit: 3 requests per 10 minutes per IP
  const ip = getClientIp(request)
  const rl = checkRateLimit(`verify-send:${ip}`, { maxAttempts: 3, windowMs: 10 * 60 * 1000 })
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const sessionToken = authHeader.slice(7)
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: { select: { id: true, email: true, firstName: true, emailVerified: true } } },
    })

    if (!session || session.expiresAt < new Date()) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.emailVerified) {
      return Response.json({ message: 'El email ya esta verificado' })
    }

    // Delete existing verification tokens
    await prisma.emailVerification.deleteMany({ where: { userId: session.user.id } })

    // Create new token (24 hour expiry)
    const token = generateToken()
    await prisma.emailVerification.create({
      data: {
        userId: session.user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const verifyUrl = `${process.env.NEXT_PUBLIC_URL || 'https://sysccom.mx'}/cuenta/verify-email?token=${token}`
    sendEmailVerification(session.user.email, session.user.firstName, verifyUrl).catch((err) => {
      console.error('Failed to send verification email:', err)
    })

    return Response.json({ message: 'Email de verificacion enviado' })
  } catch (error) {
    console.error('Send verification error:', error)
    return Response.json({ error: 'Error al enviar verificacion' }, { status: 500 })
  }
}

// GET: Verify email with token
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return Response.json({ error: 'Token invalido' }, { status: 400 })
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: { select: { id: true, emailVerified: true } } },
    })

    if (!verification) {
      return Response.json({ error: 'Token invalido o expirado' }, { status: 400 })
    }

    if (verification.expiresAt < new Date()) {
      return Response.json({ error: 'Este enlace ha expirado. Solicita uno nuevo.' }, { status: 400 })
    }

    if (verification.user.emailVerified) {
      return Response.json({ message: 'El email ya esta verificado' })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.user.id },
        data: { emailVerified: true },
      }),
      prisma.emailVerification.delete({
        where: { id: verification.id },
      }),
    ])

    return Response.json({ message: 'Email verificado exitosamente' })
  } catch (error) {
    console.error('Verify email error:', error)
    return Response.json({ error: 'Error al verificar email' }, { status: 500 })
  }
}
