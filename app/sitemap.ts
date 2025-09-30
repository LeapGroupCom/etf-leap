import 'server-only'

import { GetAllEtfsLocalesDocument, GetAllPagesDocument } from '@/graphql/generated/graphql'
import { routing } from '@/i18n/routing'
import { serverEnv } from '@/serverEnv'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import type { MetadataRoute } from 'next'

/**
 * Sitemap Caching Configuration
 * - Revalidates every 24 hours (86400 seconds)
 * - Can be manually revalidated via webhook at /api/revalidate
 * - Longer cache time since sitemaps change less frequently than content
 */
export const revalidate = 86400 // 24 hours

/**
 * Main Sitemap
 * Generates sitemap entries for all pages, ETFs, and WordPress content
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = serverEnv.NEXT_PUBLIC_SITE_URL

	// Static Pages
	const staticPages: MetadataRoute.Sitemap = []

	// Add homepage for each locale
	routing.locales.forEach(locale => {
		staticPages.push({
			url: `${baseUrl}/${locale}`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1.0,
		})
	})

	// Fetch all WordPress pages
	const pagesData = await fetchGraphQL(GetAllPagesDocument, undefined, {
		tags: ['pages-sitemap'],
	})

	const pages = pagesData?.pages?.nodes ?? []

	// Generate sitemap entries for WordPress pages
	const wordpressPages: MetadataRoute.Sitemap = pages
		.filter(page => {
			// Exclude home page as it's already added as static page
			return page.slug && page.slug !== 'home' && page.uri && !page.isFrontPage
		})
		.map(page => {
			const locale = page.language!.slug!.toLowerCase() as (typeof routing.locales)[number]
			// Add entry for each locale
			return {
				url: `${baseUrl}/${locale}${page.uri}`,
				lastModified: new Date(),
				changeFrequency: 'monthly' as const,
				priority: 0.7,
			}
		})

	// Fetch all ETFs with their locales
	const etfsData = await fetchGraphQL(GetAllEtfsLocalesDocument, undefined, {
		tags: ['etfs-sitemap'],
	})

	const etfs = etfsData?.etfs?.nodes ?? []

	// Generate sitemap entries for each ETF
	const etfEntries: MetadataRoute.Sitemap = etfs
		.filter(etf => etf.slug && etf.language?.slug)
		.map(etf => {
			const locale = etf.language!.slug!.toLowerCase() as (typeof routing.locales)[number]
			const url = `${baseUrl}/${locale}/etfs/${etf.slug}`

			return {
				url,
				lastModified: new Date(),
				changeFrequency: 'monthly' as const,
				priority: 0.8,
			}
		})

	// Combine all entries
	return [...staticPages, ...wordpressPages, ...etfEntries]
}
