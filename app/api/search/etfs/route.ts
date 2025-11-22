import { GetAllEtfsDocument, LanguageCodeEnum } from '@/graphql/generated/graphql'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { SearchResultItem } from '@/utils/search'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const bodySchema = z.object({
	search: z.string(),
	locale: z.string(),
})

export async function POST(request: NextRequest) {
	const bodyResult = bodySchema.safeParse(await request.json())

	if (!bodyResult.success) {
		return NextResponse.json(bodyResult.error, { status: 400 })
	}

	const { search, locale } = bodyResult.data

	const resp = await fetchGraphQL(
		GetAllEtfsDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			search,
			pageSize: 20,
		},
		{
			tags: [`etfs-search-${search}-${locale}`],
		}
	)

	const searchResults: SearchResultItem[] = resp?.etfs?.nodes.map((node) => ({
		id: node.id,
		slug: node.slug ?? '',
		title: node.title ?? '',
		uri: node.uri ?? '',
		ticker: node.cptEtfs?.symbol ?? null
	})) ?? []


	// const etfs: any[] = [
	// 	{
	// 		id: '1',
	// 		name: 'ETF 1',
	// 		slug: 'etf-1',
	// 	},
	// 	{
	// 		id: '2',
	// 		name: 'ETF 2',
	// 		slug: 'etf-2',
	// 	},
	// 	{
	// 		id: '3',
	// 		name: 'ETF 3',
	// 		slug: 'etf-3',
	// 	},
	// ]

	return NextResponse.json(searchResults)
}
