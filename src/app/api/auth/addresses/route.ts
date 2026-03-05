import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await verifyToken(request)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  })

  return Response.json({ addresses })
}

export async function POST(request: NextRequest) {
  const user = await verifyToken(request)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { label, street, colony, city, state, postalCode, isDefault } = body

    if (!street || !colony || !city || !state || !postalCode) {
      return Response.json(
        { error: 'Todos los campos de direccion son requeridos' },
        { status: 400 }
      )
    }

    // Validate postal code format (5 digits for Mexico)
    if (!/^\d{5}$/.test(postalCode)) {
      return Response.json(
        { error: 'Codigo postal invalido (5 digitos)' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitize = (s: string) => s.trim().slice(0, 200)

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    // If this is the first address, make it default
    const addressCount = await prisma.address.count({ where: { userId: user.id } })

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: sanitize(label || 'Casa'),
        street: sanitize(street),
        colony: sanitize(colony),
        city: sanitize(city),
        state: sanitize(state),
        postalCode: postalCode.trim(),
        country: 'Mexico',
        isDefault: isDefault || addressCount === 0,
      },
    })

    return Response.json({ address }, { status: 201 })
  } catch (error) {
    console.error('Create address error:', error)
    return Response.json({ error: 'Error al crear direccion' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await verifyToken(request)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, label, street, colony, city, state, postalCode, isDefault } = body

    if (!id) {
      return Response.json({ error: 'ID de direccion requerido' }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return Response.json({ error: 'Direccion no encontrada' }, { status: 404 })
    }

    const sanitize = (s: string) => s.trim().slice(0, 200)

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(label && { label: sanitize(label) }),
        ...(street && { street: sanitize(street) }),
        ...(colony && { colony: sanitize(colony) }),
        ...(city && { city: sanitize(city) }),
        ...(state && { state: sanitize(state) }),
        ...(postalCode && { postalCode: postalCode.trim() }),
        ...(isDefault !== undefined && { isDefault }),
      },
    })

    return Response.json({ address })
  } catch (error) {
    console.error('Update address error:', error)
    return Response.json({ error: 'Error al actualizar direccion' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await verifyToken(request)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'ID de direccion requerido' }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return Response.json({ error: 'Direccion no encontrada' }, { status: 404 })
    }

    // Check if address is used in orders
    const ordersWithAddress = await prisma.order.count({
      where: { addressId: id },
    })

    if (ordersWithAddress > 0) {
      return Response.json(
        { error: 'No se puede eliminar una direccion asociada a pedidos' },
        { status: 400 }
      )
    }

    await prisma.address.delete({ where: { id } })

    // If deleted address was default, set another one as default
    if (existing.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: user.id },
      })
      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        })
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete address error:', error)
    return Response.json({ error: 'Error al eliminar direccion' }, { status: 500 })
  }
}
