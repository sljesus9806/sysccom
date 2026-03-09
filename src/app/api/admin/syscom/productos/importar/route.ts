import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { getProducto, getTipoCambio, SyscomProductoDetalle } from '@/lib/syscom-api'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|bmp|svg)$/i
const THUMB_PATTERNS = /thumb|small|miniatura|chica|_s\.|_xs\./i

function isImageUrl(url: string): boolean {
  return IMAGE_EXTENSIONS.test(url) || /^https?:\/\/.+/i.test(url)
}

function addUrl(url: string | undefined | null, images: { url: string; position: number; alt: string }[], seenUrls: Set<string>, alt: string): boolean {
  const trimmed = url?.trim()
  if (!trimmed || seenUrls.has(trimmed)) return false
  seenUrls.add(trimmed)
  images.push({ url: trimmed, position: images.length, alt })
  return true
}

/**
 * Collect images from SYSCOM product in priority order:
 * 1. 'recursos' (BancoFotografias - highest resolution)
 * 2. 'fotos' array (if available, look for high-res variants)
 * 3. 'img_grande' / 'img_mediana' fields
 * 4. 'imagenes' array (skip thumbnails if possible)
 * 5. 'img_portada' (usually a thumbnail, last resort)
 */
function collectImages(sp: SyscomProductoDetalle): { url: string; position: number; alt: string }[] {
  const images: { url: string; position: number; alt: string }[] = []
  const seenUrls = new Set<string>()

  // 1. High-res images from 'recursos' (BancoFotografias / ftp3.syscom.mx)
  if (sp.recursos && Array.isArray(sp.recursos)) {
    for (const r of sp.recursos) {
      const rec = r as Record<string, unknown>
      const path = (rec.path as string | undefined)?.trim()
      if (path && IMAGE_EXTENSIONS.test(path)) {
        addUrl(path, images, seenUrls, sp.titulo)
      }
    }
  }

  // 2. 'fotos' array - look for highest resolution variant in each entry
  if (images.length === 0 && sp.fotos && Array.isArray(sp.fotos)) {
    for (const foto of sp.fotos) {
      const rec = foto as Record<string, unknown>
      // Try high-res fields first: original, grande, zoom, src, url
      const candidates = [
        rec.original, rec.grande, rec.zoom, rec.hd, rec.alta,
        rec.large, rec.big, rec.full, rec.src, rec.url, rec.imagen,
        rec.mediana, rec.medium,
      ].filter(Boolean) as string[]
      const best = candidates.find(u => typeof u === 'string' && u.trim() && !THUMB_PATTERNS.test(u))
        || candidates[0]
      if (best) addUrl(best, images, seenUrls, sp.titulo)
    }
  }

  // 3. Specific size fields: prefer largest available
  if (images.length === 0) {
    const sizeFields = [sp.img_grande, sp.img_mediana]
    for (const url of sizeFields) {
      if (url && addUrl(url, images, seenUrls, sp.titulo)) break
    }
  }

  // 4. 'imagenes' array - prefer URLs that don't match thumbnail patterns
  if (images.length === 0 && sp.imagenes && Array.isArray(sp.imagenes)) {
    for (let idx = 0; idx < sp.imagenes.length; idx++) {
      const img = sp.imagenes[idx] as Record<string, unknown>
      const rawUrl = (img.url || img.imagen) as string | undefined
      if (rawUrl && rawUrl.trim()) {
        addUrl(rawUrl, images, seenUrls, sp.titulo)
      }
    }
  }

  // 5. img_portada as last resort (usually a low-res thumbnail)
  if (images.length === 0) {
    addUrl(sp.img_portada, images, seenUrls, sp.titulo)
  }

  return images
}

export async function POST(request: Request) {
  const user = await verifyAdminToken(request)
  if (!user) return unauthorizedResponse()

  const body = await request.json()
  const { productoIds, categoryId, updateImages } = body as { productoIds: number[]; categoryId?: string; updateImages?: boolean }

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

  // Fetch exchange rate (SYSCOM prices are in USD)
  let tipoCambio: number
  try {
    const tc = await getTipoCambio()
    tipoCambio = parseFloat(tc.normal)
    if (!tipoCambio || tipoCambio <= 0) {
      return NextResponse.json(
        { error: 'No se pudo obtener un tipo de cambio válido' },
        { status: 500 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener el tipo de cambio de SYSCOM' },
      { status: 500 }
    )
  }

  const IVA = 0.16
  const MARGEN = 0.20

  for (const pid of productoIds) {
    try {
      const sp = await getProducto(String(pid))

      // Check if product already exists by SKU
      const existing = await prisma.product.findUnique({
        where: { sku: sp.modelo },
      })

      if (existing && !updateImages) {
        results.push({ id: pid, modelo: sp.modelo, status: 'exists' })
        continue
      }

      if (existing && updateImages) {
        // Re-sync images: delete old ones and re-import from SYSCOM
        const newImages = collectImages(sp)
        if (newImages.length > 0) {
          await prisma.productImage.deleteMany({ where: { productId: existing.id } })
          await prisma.productImage.createMany({
            data: newImages.map((img) => ({
              productId: existing.id,
              url: img.url,
              position: img.position,
              alt: img.alt,
            })),
          })
        }
        results.push({ id: pid, modelo: sp.modelo, status: 'images_updated' })
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

      // Parse prices: convert USD to MXN, add IVA (16%), apply 20% margin
      const costoDistribuidorUSD = parseFloat(sp.precios.precio_descuento) || parseFloat(sp.precios.precio_lista) || 0
      const precioListaUSD = parseFloat(sp.precios.precio_lista) || 0

      // Convert to MXN
      const costoDistribuidorMXN = costoDistribuidorUSD * tipoCambio
      const precioListaMXN = precioListaUSD * tipoCambio

      // Apply margin + IVA: precio final = (costo * (1 + margen)) * (1 + IVA)
      const precioVenta = Math.round(costoDistribuidorMXN * (1 + MARGEN) * (1 + IVA) * 100) / 100
      const precioListaConMargen = Math.round(precioListaMXN * (1 + MARGEN) * (1 + IVA) * 100) / 100
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

      // Import images using shared collector
      const images = collectImages(sp)

      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img) => ({
            productId: product.id,
            url: img.url,
            position: img.position,
            alt: img.alt,
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
  const imagesUpdated = results.filter((r) => r.status === 'images_updated').length
  const errors = results.filter((r) => r.status === 'error').length

  const parts = [`${imported} importados`, `${existed} ya existían`]
  if (imagesUpdated > 0) parts.push(`${imagesUpdated} imágenes actualizadas`)
  parts.push(`${errors} errores`)

  return NextResponse.json({
    message: `Importación completada: ${parts.join(', ')}. Tipo de cambio: $${tipoCambio.toFixed(2)} MXN/USD. Precios con IVA (16%) incluido.`,
    results,
  })
}
