import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 3 requests per 15 minutes per IP
  const ip = getClientIp(request)
  const rl = checkRateLimit(`forgot:${ip}`, { maxAttempts: 3, windowMs: 15 * 60 * 1000 })
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return Response.json({ error: 'Email requerido' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Always return success to prevent email enumeration
    const successResponse = Response.json({
      message: 'Si el email existe en nuestro sistema, recibiras un enlace de recuperacion.',
    })

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, firstName: true, email: true, isActive: true },
    })

    if (!user || !user.isActive) {
      return successResponse
    }

    // Delete any existing password reset tokens for this user
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } })

    // Create new token (1 hour expiry)
    const token = generateToken()
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    })

    // Send email (non-blocking)
    const resetUrl = `${process.env.NEXT_PUBLIC_URL || 'https://sysccom.mx'}/cuenta/reset-password?token=${token}`
    sendPasswordResetEmail(user.email, user.firstName, resetUrl).catch((err) => {
      console.error('Failed to send password reset email:', err)
    })

    return successResponse
  } catch (error) {
    console.error('Forgot password error:', error)
    return Response.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}
