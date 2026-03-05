import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        firstName: review.user.firstName,
        lastName: review.user.lastName,
      },
    }))

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return Response.json({
      reviews: formattedReviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalCount: reviews.length,
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return Response.json({ error: 'Error al obtener reseñas' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyToken(request)
  if (!user) {
    return Response.json({ error: 'Inicia sesión para dejar una reseña' }, { status: 401 })
  }

  const { id: productId } = await params

  try {
    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return Response.json(
        { error: 'La calificación debe ser entre 1 y 5' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    })

    if (existingReview) {
      // Update existing review
      const updated = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment: comment || null },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      })

      // Recalculate product rating
      await updateProductRating(productId)

      return Response.json({ review: updated })
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    // Update product rating
    await updateProductRating(productId)

    return Response.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return Response.json({ error: 'Error al crear reseña' }, { status: 500 })
  }
}

async function updateProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  })

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    },
  })
}
