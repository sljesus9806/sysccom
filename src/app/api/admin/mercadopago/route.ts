import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

// GET: Obtener configuración actual de MercadoPago
export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const config = await prisma.mercadoPagoConfig.findFirst({
      where: { isActive: true },
    })

    if (!config) {
      return NextResponse.json({ configured: false })
    }

    return NextResponse.json({
      configured: true,
      publicKey: config.publicKey,
      accessTokenHint: config.accessToken.slice(0, 8) + '••••••••',
      webhookSecretHint: config.webhookSecret ? config.webhookSecret.slice(0, 4) + '••••••••' : null,
      isSandbox: config.isSandbox,
      updatedAt: config.updatedAt,
    })
  } catch (err) {
    console.error('Error leyendo config MercadoPago:', err)
    return NextResponse.json(
      { error: 'Error al consultar la base de datos.' },
      { status: 500 }
    )
  }
}

// POST: Guardar credenciales de MercadoPago
export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const body = await request.json()
  const { publicKey, accessToken, webhookSecret, isSandbox } = body

  if (!publicKey || !accessToken) {
    return NextResponse.json(
      { error: 'Se requieren Public Key y Access Token' },
      { status: 400 }
    )
  }

  try {
    // Desactivar configs existentes
    await prisma.mercadoPagoConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Crear nueva configuración
    const config = await prisma.mercadoPagoConfig.create({
      data: {
        publicKey,
        accessToken,
        webhookSecret: webhookSecret || null,
        isSandbox: isSandbox ?? true,
        isActive: true,
      },
    })

    return NextResponse.json({
      configured: true,
      publicKey: config.publicKey,
      accessTokenHint: config.accessToken.slice(0, 8) + '••••••••',
      isSandbox: config.isSandbox,
      message: 'Credenciales de MercadoPago guardadas correctamente',
    })
  } catch (err) {
    console.error('Error guardando config MercadoPago:', err)
    return NextResponse.json(
      { error: 'Error al guardar en la base de datos.' },
      { status: 500 }
    )
  }
}
