import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://sysccom.mx'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/productos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/ofertas`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/cuenta`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Dynamic category pages
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    })
    categoryPages = categories.map((cat: { slug: string }) => ({
      url: `${siteUrl}/productos?categoria=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB not available during build
  }

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    })
    productPages = products.map((product: { slug: string; updatedAt: Date }) => ({
      url: `${siteUrl}/productos/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {
    // DB not available during build
  }

  return [...staticPages, ...categoryPages, ...productPages]
}
