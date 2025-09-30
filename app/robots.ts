import 'server-only'

import { serverEnv } from '@/serverEnv'
import type { MetadataRoute } from 'next'

/**
 * Robots.txt Configuration
 * Using TypeScript for type safety and dynamic sitemap URL generation
 */
export default function robots(): MetadataRoute.Robots {
	const baseUrl = serverEnv.NEXT_PUBLIC_SITE_URL

	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/api/', '/_next/'],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	}
}
