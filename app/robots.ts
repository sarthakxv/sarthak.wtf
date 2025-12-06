import type { MetadataRoute } from 'next'
import { WEBSITE_URL } from '@/app/data'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${WEBSITE_URL}/sitemap.xml`,
  }
}
