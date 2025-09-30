import { Breadcrumbs } from '@/components/breadcrumbs'
import { Container, Prose, Section } from '@/components/craft'
import {
	GetAllEtfsCategoriesDocument,
	GetAllEtfsDocument,
	GetAllEtfsTagsDocument,
	GetPageDocument,
	LanguageCodeEnum,
} from '@/graphql/generated/graphql'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { isNotNullish, isNullish } from '@/utils/types'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Balancer from 'react-wrap-balancer'
import { PageClient } from './page-client'

type Props = {
	searchParams: Promise<{
		tag?: string
		category?: string
		page?: string
		search?: string
	}>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
	const { tag, category, page: pageParam, search } = await searchParams
	const isIndex = isNullish(tag) && isNullish(category) && isNullish(search) && isNullish(pageParam)

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

	return {
		title: page.seo?.title,
		description: page.seo?.metaDesc,
		robots: {
			index: isIndex,
			follow: true,
		},
	}
}

export const dynamic = 'auto'
export const revalidate = 600
const PAGE_SIZE_ETFS = 24

export default async function Page({ searchParams }: Props) {
	const params = await searchParams
	const { tag, category, page: pageParam, search } = params
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

	const paginatedCacheTags = [
		'etfs',
		...[search ? `etfs-search-${search}` : ''],
		...[tag ? `etfs-tag-${tag}` : ''],
		...[category ? `etfs-category-${category}` : ''],
	].filter(isNotNullish)

	const dataPromise = fetchGraphQL(
		GetAllEtfsDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			search,
			category,
			tag,
			pageSize: PAGE_SIZE_ETFS,
			skip: (pageNumber - 1) * PAGE_SIZE_ETFS,
		},
		{
			tags: paginatedCacheTags,
		}
	)

	const filtersPromise = Promise.all([
		fetchGraphQL(
			GetAllEtfsCategoriesDocument,
			{},
			{
				tags: ['etfs-categories'],
			}
		),
		fetchGraphQL(
			GetAllEtfsTagsDocument,
			{},
			{
				tags: ['etfs-tags'],
			}
		),
	])

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

						<PageClient dataPromise={dataPromise} filtersPromise={filtersPromise} />
					</div>
				</Container>
			</Section>
		</>
	)
}
