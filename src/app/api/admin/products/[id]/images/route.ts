import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'products')
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const images = await prisma.productImage.findMany({
    where: { productId: id },
    orderBy: { position: 'asc' },
  })

  return NextResponse.json(images)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  try {
    const { id } = await params

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron imágenes' }, { status: 400 })
    }

    // Get current max position
    const lastImage = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { position: 'desc' },
    })
    let position = (lastImage?.position ?? -1) + 1

    const created = []

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        continue // Skip invalid file types
      }
      if (file.size > MAX_SIZE) {
        continue // Skip files that are too large
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${id}-${randomUUID()}.${ext}`
      const filePath = join(UPLOAD_DIR, fileName)

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)

      const image = await prisma.productImage.create({
        data: {
          productId: id,
          url: `/uploads/products/${fileName}`,
          alt: product.name,
          position,
        },
      })

      created.push(image)
      position++
    }

    if (created.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron procesar las imágenes. Formatos permitidos: JPG, PNG, WebP, GIF. Máximo 5MB.' },
        { status: 400 }
      )
    }

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: 'Error al subir imágenes' }, { status: 500 })
  }
}
