import { Breadcrumbs } from '@/components/breadcrumbs'
import { Container, Prose, Section } from '@/components/craft'
import { EtfsPaginatedList } from '@/components/etfs-paginated-list'
import { EtfsSearch } from '@/components/etfs-search'
import { GetAllEtfsDocument, GetEtfCategoryDocument, LanguageCodeEnum } from '@/graphql/generated/graphql'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { isNullish } from '@/utils/types'
import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Balancer from 'react-wrap-balancer'

type Props = {
	params: Promise<{
		category_slug: string
	}>

	searchParams: Promise<{
		page?: string
	}>
}

export const dynamic = 'auto'
export const revalidate = 600
const PAGE_SIZE_ETFS = 24

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
	const { category_slug } = await params
	const { page: pageParam } = await searchParams
	const isIndex = isNullish(pageParam)

	const locale = await getLocale()
	const pageData = await fetchGraphQL(
		GetEtfCategoryDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			slug: category_slug,
		},
		{
			tags: [`etf-category-${category_slug}`],
		}
	)

	const category = pageData?.etfCategory?.translation

	if (!category) {
		return {}
	}

	return {
		title: category.seo?.title,
		description: category.seo?.metaDesc,
		robots: {
			index: isIndex,
			follow: true,
		},
	}
}

export default async function Page({ params, searchParams }: PageProps<'/[locale]/etfs/categories/[category_slug]'>) {
	const locale = await getLocale()
	const { category_slug } = await params
	const { page: pageParam, search } = await searchParams
	const pageNumber = pageParam ? parseInt(pageParam as string, 10) : 1

	const pageData = await fetchGraphQL(
		GetEtfCategoryDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			slug: category_slug,
		},
		{
			tags: [`etf-category-${category_slug}`],
		}
	)

	if (!pageData?.etfCategory?.translation) {
		return notFound()
	}

	const promiseQueryKeys = [`category-etfs-${category_slug}`]
	const dataPromise = fetchGraphQL(
		GetAllEtfsDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			category: category_slug,
			pageSize: PAGE_SIZE_ETFS,
			skip: (pageNumber - 1) * PAGE_SIZE_ETFS,
		},
		{
			tags: promiseQueryKeys,
		}
	)

	const breadcrumbs = pageData?.etfCategory?.translation?.seo?.breadcrumbs ?? []

	const breadcrumbsItems = breadcrumbs.map(breadcrumb => ({
		text: breadcrumb?.text ?? '',
		url: breadcrumb?.url ?? '',
	}))

	return (
		<>
			{breadcrumbsItems.length > 0 && <Breadcrumbs items={breadcrumbsItems} />}

			<Section>
				<Container>
					<div className="space-y-8">
						<Prose>
							<h1 className="text-center">
								<Balancer>{pageData.etfCategory?.translation?.name}</Balancer>
							</h1>
						</Prose>

						<EtfsSearch />

						<EtfsPaginatedList dataPromise={dataPromise} pageSize={PAGE_SIZE_ETFS} queryKeys={promiseQueryKeys} />
					</div>
				</Container>
			</Section>
		</>
	)
}
