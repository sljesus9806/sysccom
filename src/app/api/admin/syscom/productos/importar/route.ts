import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { getProducto } from '@/lib/syscom-api'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const body = await request.json()
  const { productoIds, categoryId } = body as { productoIds: number[]; categoryId?: string }

  if (!productoIds || !Array.isArray(productoIds) || productoIds.length === 0) {
    return NextResponse.json(
      { error: 'Se requiere un array de productoIds' },
      { status: 400 }
    )
  }

  if (productoIds.length > 20) {
    return NextResponse.json(
      { error: 'Máximo 20 productos por importación' },
      { status: 400 }
    )
  }

  const results: { id: number; modelo: string; status: string; error?: string }[] = []

  for (const pid of productoIds) {
    try {
      const sp = await getProducto(String(pid))

      // Check if product already exists by SKU
      const existing = await prisma.product.findUnique({
        where: { sku: sp.modelo },
      })

      if (existing) {
        results.push({ id: pid, modelo: sp.modelo, status: 'exists' })
        continue
      }

      // Find or create brand
      const brandSlug = slugify(sp.marca)
      let brand = await prisma.brand.findUnique({ where: { slug: brandSlug } })
      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name: sp.marca,
            slug: brandSlug,
            logo: sp.marca_logo || null,
          },
        })
      }

      // Use provided categoryId or find/create from first SYSCOM category
      let catId = categoryId
      if (!catId) {
        const catName = sp.categorias?.[0]?.nombre || 'General'
        const catSlug = slugify(catName)
        let cat = await prisma.category.findUnique({ where: { slug: catSlug } })
        if (!cat) {
          cat = await prisma.category.create({
            data: { name: catName, slug: catSlug },
          })
        }
        catId = cat.id
      }

      // Parse prices: costo distribuidor + 20% margen = precio de venta
      const MARGEN = 0.20
      const costoDistribuidor = parseFloat(sp.precios.precio_descuento) || parseFloat(sp.precios.precio_lista) || 0
      const precioVenta = Math.round(costoDistribuidor * (1 + MARGEN) * 100) / 100
      const precioLista = parseFloat(sp.precios.precio_lista) || 0
      const precioListaConMargen = Math.round(precioLista * (1 + MARGEN) * 100) / 100
      const discount = precioListaConMargen > precioVenta
        ? Math.round(((precioListaConMargen - precioVenta) / precioListaConMargen) * 100)
        : null

      // Create product
      const productSlug = slugify(`${sp.modelo}-${sp.marca}-${pid}`)
      const product = await prisma.product.create({
        data: {
          name: sp.titulo,
          slug: productSlug,
          description: sp.descripcion || sp.titulo,
          price: precioVenta,
          originalPrice: discount ? precioListaConMargen : null,
          sku: sp.modelo,
          stock: sp.total_existencia,
          supplier: 'SYSCOM',
          discount,
          isActive: true,
          isNew: true,
          categoryId: catId,
          brandId: brand.id,
        },
      })

      // Import images
      const images: { url: string; position: number }[] = []
      if (sp.img_portada) {
        images.push({ url: sp.img_portada, position: 0 })
      }
      if (sp.imagenes) {
        sp.imagenes.forEach((img, idx) => {
          images.push({ url: img.url, position: idx + 1 })
        })
      }

      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img) => ({
            productId: product.id,
            url: img.url,
            position: img.position,
          })),
        })
      }

      results.push({ id: pid, modelo: sp.modelo, status: 'imported' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      results.push({ id: pid, modelo: String(pid), status: 'error', error: message })
    }
  }

  const imported = results.filter((r) => r.status === 'imported').length
  const existed = results.filter((r) => r.status === 'exists').length
  const errors = results.filter((r) => r.status === 'error').length

  return NextResponse.json({
    message: `Importación completada: ${imported} importados, ${existed} ya existían, ${errors} errores`,
    results,
  })
}
