import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { validarCredenciales } from '@/lib/syscom-api'

interface SyscomConfigRow {
  id: string
  client_id: string
  client_secret: string
  access_token: string | null
  token_expiry: Date | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// GET: Obtener configuración actual (sin exponer secret completo)
export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const rows = await prisma.$queryRaw<SyscomConfigRow[]>`
      SELECT * FROM syscom_config WHERE is_active = true LIMIT 1
    `
    const config = rows[0]

    if (!config) {
      return NextResponse.json({ configured: false })
    }

    return NextResponse.json({
      configured: true,
      clientId: config.client_id,
      clientSecretHint: config.client_secret.slice(0, 4) + '••••••••',
      hasValidToken: !!(config.access_token && config.token_expiry && config.token_expiry > new Date()),
      updatedAt: config.updated_at,
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
    await prisma.$executeRaw`
      UPDATE syscom_config SET is_active = false WHERE is_active = true
    `

    // Create new config
    const id = crypto.randomUUID()
    const now = new Date()
    await prisma.$executeRaw`
      INSERT INTO syscom_config (id, client_id, client_secret, is_active, created_at, updated_at)
      VALUES (${id}, ${clientId}, ${clientSecret}, true, ${now}, ${now})
    `

    return NextResponse.json({
      configured: true,
      clientId,
      clientSecretHint: clientSecret.slice(0, 4) + '••••••••',
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
