import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://sysccom.mx'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/cuenta/perfil', '/cuenta/pedidos', '/cuenta/direcciones'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
