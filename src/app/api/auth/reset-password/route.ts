import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 5 attempts per 15 minutes per IP
  const ip = getClientIp(request)
  const rl = checkRateLimit(`reset:${ip}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 })
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return Response.json({ error: 'Token y contrasena son requeridos' }, { status: 400 })
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

    // Validate token format
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return Response.json({ error: 'Token invalido' }, { status: 400 })
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: { select: { id: true, isActive: true } } },
    })

    if (!resetRecord) {
      return Response.json({ error: 'Token invalido o expirado' }, { status: 400 })
    }

    if (resetRecord.usedAt) {
      return Response.json({ error: 'Este enlace ya fue utilizado' }, { status: 400 })
    }

    if (resetRecord.expiresAt < new Date()) {
      return Response.json({ error: 'Este enlace ha expirado. Solicita uno nuevo.' }, { status: 400 })
    }

    if (!resetRecord.user.isActive) {
      return Response.json({ error: 'Cuenta desactivada' }, { status: 403 })
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(password)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all existing sessions (security: force re-login)
      prisma.session.deleteMany({
        where: { userId: resetRecord.user.id },
      }),
    ])

    return Response.json({
      message: 'Contrasena actualizada exitosamente. Inicia sesion con tu nueva contrasena.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return Response.json({ error: 'Error al restablecer la contrasena' }, { status: 500 })
  }
}
