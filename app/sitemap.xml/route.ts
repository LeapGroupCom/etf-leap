import { serverEnv } from '@/serverEnv'
import { SitemapType } from '@/utils/sitemap'
import { NextResponse } from 'next/server'

export const revalidate = 86400 // 24 hours

export async function GET(request: Request) {
	const base = serverEnv.NEXT_PUBLIC_SITE_URL

	const ids: SitemapType[] = ['pages-sitemap', 'etfs-sitemap']

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${ids
			.map(
				id => `<sitemap>
        <loc>${base}/sitemap/${id}.xml</loc>
      </sitemap>`
			)
			.join('\n')}
  </sitemapindex>`

	return new NextResponse(xml, {
		headers: {
			'Content-Type': 'application/xml',
		},
	})
}
