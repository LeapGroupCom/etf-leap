import {
	GetAllEtfsForSitemapDocument,
	GetAllEtfsForSitemapQuery,
	GetAllPagesForSitemapDocument,
	GetAllPagesForSitemapQuery,
} from '@/graphql/generated/graphql'
import { routing } from '@/i18n/routing'
import { serverEnv } from '@/serverEnv'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { SitemapTypeXml } from '@/utils/sitemap'
import type { MetadataRoute } from 'next'
import { NextResponse } from 'next/server'
import { match } from 'ts-pattern'

export const revalidate = 86400 // 24 hours

export async function GET(request: Request, { params }: { params: Promise<{ sitemapId: string }> }) {
	const { sitemapId } = await params

	const entries = await match(sitemapId as SitemapTypeXml)
		.with('pages-sitemap.xml', async () => generatePagesSitemap())
		.with('etfs-sitemap.xml', async () => generateEtfsSitemap())
		.exhaustive()

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${entries?.join('\n')}
    </urlset>`

	return new NextResponse(xml, {
		headers: {
			'Content-Type': 'application/xml',
		},
	})
}

const generatePagesSitemap = async () => {
	const pagesData = await fetchGraphQL(GetAllPagesForSitemapDocument, undefined, {
		tags: ['pages-sitemap'],
	})

	const pages = pagesData?.pages?.nodes ?? []
	const pagesEntries: MetadataRoute.Sitemap = parseEntries(pages)

	return generateXmlMarkup(pagesEntries)
}

const generateEtfsSitemap = async () => {
	const etfs = await getEtfsRecords()
	const etfEntries: MetadataRoute.Sitemap = parseEntries(etfs)

	return generateXmlMarkup(etfEntries)
}

type ParseEntriesProps =
	| NonNullable<GetAllPagesForSitemapQuery['pages']>['nodes']
	| NonNullable<GetAllEtfsForSitemapQuery['etfs']>['nodes']

const parseEntries = (entries: ParseEntriesProps) => {
	const base = serverEnv.NEXT_PUBLIC_SITE_URL

	return entries.map(i => {
		const locale = i.language!.slug!.toLowerCase() as (typeof routing.locales)[number]

		const localePrefix = match(locale)
			.with('en', () => '')
			.with('fr', () => '/fr')
			.exhaustive()

		return match(i)
			.with({ __typename: 'Page', isFrontPage: true }, () => ({
				url: `${base}${localePrefix}`,
				lastModified: new Date(i.date ?? '').toISOString(),
			}))
			.with({ __typename: 'Page' }, () => ({
				url: `${base}${localePrefix}${i.uri}`,
				lastModified: new Date(i.date ?? '').toISOString(),
			}))
			.otherwise(() => ({
				url: `${base}${localePrefix}${i.uri}`,
				lastModified: new Date(i.date ?? '').toISOString(),
			}))
	})
}

const generateXmlMarkup = (entries: MetadataRoute.Sitemap) => {
	return entries.map(
		e => `
      <url>
        <loc>${e.url}</loc>
        ${e.lastModified ? `<lastmod>${e.lastModified}</lastmod>` : ''}
      </url>
    `
	)
}

async function getEtfsRecords(): Promise<NonNullable<GetAllEtfsForSitemapQuery['etfs']>['nodes']> {
	const PAGE_SIZE = 100

	const loadRecords = async (allRecords: any[], page: number): Promise<any[]> => {
		const items = await fetchGraphQL(
			GetAllEtfsForSitemapDocument,
			{
				pageSize: PAGE_SIZE,
				offset: (page - 1) * PAGE_SIZE,
			},
			{
				tags: ['etfs-sitemap'],
			}
		)

		const nodes = items?.etfs?.nodes ?? []

		if (nodes.length < PAGE_SIZE) {
			return [...allRecords, ...nodes]
		}

		return loadRecords([...allRecords, ...nodes], page + 1)
	}

	return loadRecords([], 1)
}
