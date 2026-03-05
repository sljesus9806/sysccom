import { NextRequest } from 'next/server'

// Shipping carrier configuration
const CARRIERS = {
  estafeta: {
    name: 'Estafeta',
    logo: '/carriers/estafeta.png',
    trackingUrl: 'https://rastreo3.estafeta.com/Tracking/searchByGet/',
  },
  dhl: {
    name: 'DHL Express',
    logo: '/carriers/dhl.png',
    trackingUrl: 'https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=',
  },
}

// Zone-based shipping rates (simulated - in production would use carrier APIs)
const SHIPPING_ZONES: Record<string, number> = {
  // Zone 1 - Local (Chihuahua)
  'Chihuahua': 1,
  // Zone 2 - North
  'Sonora': 2, 'Durango': 2, 'Sinaloa': 2, 'Coahuila': 2,
  // Zone 3 - Central/West
  'Jalisco': 3, 'Nuevo León': 3, 'Aguascalientes': 3, 'Guanajuato': 3,
  'San Luis Potosí': 3, 'Zacatecas': 3, 'Nayarit': 3, 'Colima': 3,
  'Michoacán': 3, 'Querétaro': 3, 'Tamaulipas': 3,
  // Zone 4 - Central
  'Ciudad de México': 4, 'Estado de México': 4, 'Puebla': 4,
  'Morelos': 4, 'Tlaxcala': 4, 'Hidalgo': 4, 'Guerrero': 4,
  // Zone 5 - South/Southeast
  'Veracruz': 5, 'Oaxaca': 5, 'Chiapas': 5, 'Tabasco': 5,
  'Campeche': 5, 'Yucatán': 5, 'Quintana Roo': 5,
  // Zone 6 - Peninsula
  'Baja California': 6, 'Baja California Sur': 6,
}

interface ShippingQuote {
  carrier: string;
  carrierName: string;
  service: string;
  deliveryDays: { min: number; max: number };
  price: number;
  trackingAvailable: boolean;
}

function calculateShipping(
  state: string,
  weight: number,
  subtotal: number
): ShippingQuote[] {
  const zone = SHIPPING_ZONES[state] || 4
  const baseWeight = Math.max(1, Math.ceil(weight))

  // Estafeta rates by zone
  const estafetaBase = [0, 150, 220, 280, 340, 390, 450]
  const estafetaPerKg = [0, 15, 22, 28, 35, 42, 50]
  const estafetaPrice = estafetaBase[zone] + estafetaPerKg[zone] * baseWeight

  // DHL rates by zone (premium)
  const dhlBase = [0, 220, 310, 380, 440, 510, 580]
  const dhlPerKg = [0, 25, 32, 40, 48, 55, 65]
  const dhlPrice = dhlBase[zone] + dhlPerKg[zone] * baseWeight

  // Delivery days by zone
  const estafetaDays = {
    1: { min: 1, max: 2 },
    2: { min: 2, max: 3 },
    3: { min: 3, max: 4 },
    4: { min: 3, max: 5 },
    5: { min: 4, max: 6 },
    6: { min: 5, max: 7 },
  }
  const dhlDays = {
    1: { min: 1, max: 1 },
    2: { min: 1, max: 2 },
    3: { min: 1, max: 2 },
    4: { min: 2, max: 3 },
    5: { min: 2, max: 3 },
    6: { min: 3, max: 4 },
  }

  const quotes: ShippingQuote[] = []

  // Estafeta Terrestre
  quotes.push({
    carrier: 'estafeta',
    carrierName: 'Estafeta',
    service: 'Terrestre',
    deliveryDays: estafetaDays[zone as keyof typeof estafetaDays],
    price: estafetaPrice,
    trackingAvailable: true,
  })

  // Estafeta Express (only zones 1-4)
  if (zone <= 4) {
    quotes.push({
      carrier: 'estafeta',
      carrierName: 'Estafeta',
      service: 'Express',
      deliveryDays: { min: 1, max: Math.max(1, estafetaDays[zone as keyof typeof estafetaDays].min - 1) },
      price: Math.round(estafetaPrice * 1.6),
      trackingAvailable: true,
    })
  }

  // DHL Express
  quotes.push({
    carrier: 'dhl',
    carrierName: 'DHL Express',
    service: 'Express',
    deliveryDays: dhlDays[zone as keyof typeof dhlDays],
    price: dhlPrice,
    trackingAvailable: true,
  })

  // DHL Express 9:00 (premium)
  quotes.push({
    carrier: 'dhl',
    carrierName: 'DHL Express',
    service: 'Express 9:00 AM',
    deliveryDays: { min: 1, max: dhlDays[zone as keyof typeof dhlDays].min },
    price: Math.round(dhlPrice * 1.8),
    trackingAvailable: true,
  })

  // Free shipping for orders > $5,000
  if (subtotal > 5000) {
    quotes.unshift({
      carrier: 'estafeta',
      carrierName: 'Estafeta',
      service: 'Terrestre (Envío Gratis)',
      deliveryDays: estafetaDays[zone as keyof typeof estafetaDays],
      price: 0,
      trackingAvailable: true,
    })
  }

  return quotes.sort((a, b) => a.price - b.price)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { state, postalCode, weight, subtotal } = body

    if (!state) {
      return Response.json({ error: 'Estado requerido' }, { status: 400 })
    }

    const estimatedWeight = weight || 2 // Default 2kg per order
    const quotes = calculateShipping(state, estimatedWeight, subtotal || 0)

    return Response.json({
      quotes,
      origin: {
        city: 'Chihuahua',
        state: 'Chihuahua',
      },
      destination: {
        state,
        postalCode: postalCode || '',
      },
      estimatedWeight,
    })
  } catch (error) {
    console.error('Shipping quote error:', error)
    return Response.json({ error: 'Error al cotizar envío' }, { status: 500 })
  }
}
