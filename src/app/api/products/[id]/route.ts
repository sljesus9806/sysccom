import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { slug: true } },
      brand: { select: { name: true } },
      images: { select: { url: true }, orderBy: { position: 'asc' } },
      specs: { select: { key: true, value: true } },
    },
  })

  if (!p) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  const formatted = {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    images: p.images.length > 0 ? p.images.map((img) => img.url) : ['/placeholder-product.svg'],
    category: p.category.slug,
    subcategory: p.subcategory || undefined,
    brand: p.brand.name,
    sku: p.sku,
    supplier: p.supplier.toLowerCase(),
    stock: p.stock,
    specs: Object.fromEntries(p.specs.map((s) => [s.key, s.value])),
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    featured: p.featured,
    isNew: p.isNew,
    discount: p.discount || undefined,
  }

  return NextResponse.json(formatted)
}
