import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 20 attempts per 10 minutes per IP
  const ip = getClientIp(request)
  const rl = checkRateLimit(`coupon:${ip}`, { maxAttempts: 20, windowMs: 10 * 60 * 1000 })
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code) {
      return Response.json({ error: 'Código requerido' }, { status: 400 })
    }

    const promotion = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promotion) {
      return Response.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    if (!promotion.isActive) {
      return Response.json({ error: 'Este cupón ya no está activo' }, { status: 400 })
    }

    const now = new Date()
    if (now < promotion.startDate || now > promotion.endDate) {
      return Response.json({ error: 'Este cupón ha expirado' }, { status: 400 })
    }

    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return Response.json({ error: 'Este cupón ha alcanzado su límite de uso' }, { status: 400 })
    }

    if (promotion.minPurchase && subtotal < Number(promotion.minPurchase)) {
      return Response.json({
        error: `Compra mínima de $${Number(promotion.minPurchase).toLocaleString()} MXN requerida`,
      }, { status: 400 })
    }

    let discount = 0
    let description = ''

    switch (promotion.type) {
      case 'PERCENTAGE':
        discount = subtotal * (Number(promotion.value) / 100)
        description = `${Number(promotion.value)}% de descuento`
        break
      case 'FIXED':
        discount = Math.min(Number(promotion.value), subtotal)
        description = `$${Number(promotion.value).toLocaleString()} MXN de descuento`
        break
      case 'FREE_SHIPPING':
        discount = 0
        description = 'Envío gratis'
        break
    }

    return Response.json({
      valid: true,
      code: promotion.code,
      type: promotion.type,
      discount,
      description,
      name: promotion.name,
      freeShipping: promotion.type === 'FREE_SHIPPING',
    })
  } catch (error) {
    console.error('Validate coupon error:', error)
    return Response.json({ error: 'Error al validar cupón' }, { status: 500 })
  }
}
