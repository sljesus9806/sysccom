import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const diagnostics: {
    configExists: boolean
    isActive: boolean
    isSandbox: boolean
    hasAccessToken: boolean
    hasPublicKey: boolean
    hasWebhookSecret: boolean
    accessTokenPrefix: string
    accessTokenValid: boolean
    apiTestResult: string
    apiTestError?: string
    webhookUrl: string
  } = {
    configExists: false,
    isActive: false,
    isSandbox: false,
    hasAccessToken: false,
    hasPublicKey: false,
    hasWebhookSecret: false,
    accessTokenPrefix: '',
    accessTokenValid: false,
    apiTestResult: 'not_tested',
    webhookUrl: '',
  }

  const mpConfig = await prisma.mercadoPagoConfig.findFirst({
    where: { isActive: true },
  })

  if (!mpConfig) {
    diagnostics.apiTestResult = 'no_config'
    return NextResponse.json(diagnostics)
  }

  diagnostics.configExists = true
  diagnostics.isActive = mpConfig.isActive
  diagnostics.isSandbox = mpConfig.isSandbox
  diagnostics.hasAccessToken = !!mpConfig.accessToken
  diagnostics.hasPublicKey = !!mpConfig.publicKey
  diagnostics.hasWebhookSecret = !!mpConfig.webhookSecret
  diagnostics.accessTokenPrefix = mpConfig.accessToken
    ? mpConfig.accessToken.substring(0, 12) + '...'
    : ''

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sysccom.mx'
  diagnostics.webhookUrl = `${baseUrl}/api/mercadopago/webhook`

  // Verificar si el token de sandbox es TEST y si el modo coincide
  const isTestToken = mpConfig.accessToken?.startsWith('TEST-')
  const isAppToken = mpConfig.accessToken?.startsWith('APP_USR-')

  if (mpConfig.isSandbox && !isTestToken) {
    diagnostics.apiTestResult = 'token_mismatch'
    diagnostics.apiTestError = `El modo sandbox está activado pero el access token NO comienza con "TEST-". El token comienza con "${mpConfig.accessToken?.substring(0, 8)}...". Para sandbox debes usar un access token que comience con "TEST-".`
    return NextResponse.json(diagnostics)
  }

  if (!mpConfig.isSandbox && isTestToken) {
    diagnostics.apiTestResult = 'token_mismatch'
    diagnostics.apiTestError = `El modo producción está activado pero el access token comienza con "TEST-". Para producción debes usar un access token que comience con "APP_USR-".`
    return NextResponse.json(diagnostics)
  }

  // Probar el access token contra la API de MercadoPago
  try {
    const testResponse = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        Authorization: `Bearer ${mpConfig.accessToken}`,
      },
    })

    if (testResponse.ok) {
      const userData = await testResponse.json()
      diagnostics.accessTokenValid = true
      diagnostics.apiTestResult = 'success'

      // Verificar si es cuenta de prueba
      if (userData.tags?.includes('test_user')) {
        diagnostics.apiTestResult = 'success_test_user'
      }
    } else {
      const errorData = await testResponse.json().catch(() => ({}))
      diagnostics.apiTestResult = 'api_error'
      diagnostics.apiTestError = `API respondió con status ${testResponse.status}: ${JSON.stringify(errorData)}`
    }
  } catch (error) {
    diagnostics.apiTestResult = 'connection_error'
    diagnostics.apiTestError = `Error de conexión: ${error instanceof Error ? error.message : 'Unknown'}`
  }

  return NextResponse.json(diagnostics)
}
