import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { validarCredenciales } from '@/lib/syscom-api'

// GET: Obtener configuración actual (sin exponer secret completo)
export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const config = await prisma.syscomConfig.findFirst({
      where: { isActive: true },
    })

    if (!config) {
      return NextResponse.json({ configured: false })
    }

    return NextResponse.json({
      configured: true,
      clientId: config.clientId,
      clientSecretHint: config.clientSecret.slice(0, 4) + '••••••••',
      hasValidToken: !!(config.accessToken && config.tokenExpiry && config.tokenExpiry > new Date()),
      updatedAt: config.updatedAt,
    })
  } catch (err) {
    console.error('Error leyendo config SYSCOM de BD:', err)
    return NextResponse.json(
      { error: 'Error al consultar la base de datos.' },
      { status: 500 }
    )
  }
}

// POST: Guardar credenciales
export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const body = await request.json()
  const { clientId, clientSecret } = body

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Se requieren client_id y client_secret' },
      { status: 400 }
    )
  }

  // Validate credentials against SYSCOM
  let valid: boolean
  try {
    valid = await validarCredenciales(clientId, clientSecret)
  } catch {
    return NextResponse.json(
      { error: 'No se pudo conectar con SYSCOM. Verifica tu conexión a internet e intenta de nuevo.' },
      { status: 502 }
    )
  }
  if (!valid) {
    return NextResponse.json(
      { error: 'Credenciales inválidas. Verifica tu client_id y client_secret.' },
      { status: 400 }
    )
  }

  // Save to database
  try {
    // Deactivate existing configs
    await prisma.syscomConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Create new config
    const config = await prisma.syscomConfig.create({
      data: {
        clientId,
        clientSecret,
        isActive: true,
      },
    })

    return NextResponse.json({
      configured: true,
      clientId: config.clientId,
      clientSecretHint: config.clientSecret.slice(0, 4) + '••••••••',
      message: 'Credenciales guardadas y validadas correctamente',
    })
  } catch (err) {
    console.error('Error guardando config SYSCOM en BD:', err)
    return NextResponse.json(
      { error: 'Error al guardar en la base de datos. Verifica que el servidor de BD esté activo.' },
      { status: 500 }
    )
  }
}
