import { Breadcrumbs } from '@/components/breadcrumbs'
import { Container, Prose, Section } from '@/components/craft'
import { EtfsPaginatedList } from '@/components/etfs-paginated-list'
import { EtfsSearch } from '@/components/etfs-search'
import { GetAllEtfsDocument, GetPageDocument, LanguageCodeEnum } from '@/graphql/generated/graphql'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { isNullish } from '@/utils/types'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Balancer from 'react-wrap-balancer'

type Props = {
	searchParams: Promise<{
		page?: string
	}>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
	const { page: pageParam } = await searchParams
	
	const locale = await getLocale()
	const pageData = await fetchGraphQL(
		GetPageDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			path: '/etfs',
		},
		{
			tags: ['etfs-page'],
		}
	)
	
	const page = pageData?.page?.translation
	
	if (!page) {
		return {}
	}
	
	const index = isNullish(pageParam) && page.seo?.metaRobotsNoindex === 'index' ? true : false
	const follow = page.seo?.metaRobotsNofollow === 'follow' ? true : false

	return {
		title: page.seo?.title,
		description: page.seo?.metaDesc,
		robots: {
			index,
			follow,
		},
	}
}

export const dynamic = 'auto'
export const revalidate = 600
const PAGE_SIZE_ETFS = 24

export default async function Page({ searchParams }: Props) {
	const params = await searchParams
	const { page: pageParam } = params
	const pageNumber = pageParam ? parseInt(pageParam, 10) : 1

	const locale = await getLocale()
	const t = await getTranslations()

	const pageData = await fetchGraphQL(
		GetPageDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			path: '/etfs',
		},
		{
			tags: ['etfs-page'],
		}
	)

	const breadcrumbs = pageData?.page?.translation?.seo?.breadcrumbs ?? []
	const breadcrumbsItems = breadcrumbs.map(breadcrumb => ({
		text: breadcrumb?.text ?? '',
		url: breadcrumb?.url ?? '',
	}))

	const pageTitle = pageData?.page?.translation?.title ?? t('etfs_title')

	const promiseQueryKeys = ['etfs']
	const dataPromise = fetchGraphQL(GetAllEtfsDocument, {
		locale: locale.toUpperCase() as LanguageCodeEnum,
		pageSize: PAGE_SIZE_ETFS,
		skip: (pageNumber - 1) * PAGE_SIZE_ETFS,
	})

	return (
		<>
			{breadcrumbsItems.length > 0 && <Breadcrumbs items={breadcrumbsItems} />}

			<Section>
				<Container>
					<div className="space-y-8">
						<Prose>
							<h1 className="text-center">
								<Balancer>{pageTitle}</Balancer>
							</h1>
							<p className="text-center">
								<Balancer>{t('etfs_subtitle')}</Balancer>
							</p>
						</Prose>

						<EtfsSearch />

						<EtfsPaginatedList dataPromise={dataPromise} queryKeys={promiseQueryKeys} pageSize={PAGE_SIZE_ETFS} />
					</div>
				</Container>
			</Section>
		</>
	)
}
