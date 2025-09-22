import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'

import { Container, Prose, Section } from '@/components/craft'
import { SearchInput } from '@/components/search-input'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { FilterEtfs } from '@/components/etfs-filter'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	GetAllEtfsCategoriesDocument,
	GetAllEtfsDocument,
	GetAllEtfsTagsDocument,
	GetPageDocument,
	LanguageCodeEnum,
} from '@/graphql/generated/graphql'
import { Link } from '@/i18n/navigation'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { clamp } from '@/utils/math'
import { createNumberList } from '@/utils/pagination'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Balancer from 'react-wrap-balancer'
import { isNotNullish, isNullish } from '@/utils/types'

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
			follow: true
		}
	}
}

export const dynamic = 'auto'
export const revalidate = 600
const PAGE_SIZE = 24
const NB_MAX_PAGES = 5



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

	const paginatedCacheTags = [
		'etfs',
		...[search ? `etfs-search-${search}` : ''],
		...[tag ? `etfs-tag-${tag}` : ''],
		...[category ? `etfs-category-${category}` : ''],
	].filter(isNotNullish)

	const [etfsData, categoriesData, tagsData] = await Promise.all([
		fetchGraphQL(
			GetAllEtfsDocument,
			{
				locale: locale.toUpperCase() as LanguageCodeEnum,
				search,
				category,
				tag,
				pageSize: PAGE_SIZE,
				skip: (pageNumber - 1) * PAGE_SIZE,
			},
			{
				tags: paginatedCacheTags,
			}
		),
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

	const etfs = etfsData?.etfs?.nodes
	const totalPages = Math.ceil(
		(etfsData.etfs?.pageInfo.offsetPagination?.total ?? etfs?.length ?? PAGE_SIZE) / PAGE_SIZE
	)

	const nbNumberDisplayed = Math.min(totalPages, NB_MAX_PAGES)
	const nbMaxTranslations = Math.max(totalPages - NB_MAX_PAGES, 0)
	const numbersTranslation = clamp(0, nbMaxTranslations, pageNumber - Math.ceil(NB_MAX_PAGES / 2))
	const addGap = totalPages > 3 ? 4 : 0

	// Create pagination URL helper
	const createPaginationUrl = (newPage: number) => {
		const params = new URLSearchParams()
		if (newPage > 1) params.set('page', newPage.toString())
		if (category) params.set('category', category)
		if (tag) params.set('tag', tag)
		if (search) params.set('search', search)
		return `/etfs${params.toString() ? `?${params.toString()}` : ''}`
	}

	const categories =
		categoriesData?.etfCategories?.nodes.map(category => ({
			id: category.id,
			name: category.name ?? '',
			slug: category.slug ?? '',
		})) ?? []
	const tags =
		tagsData?.etfTags?.nodes.map(tag => ({
			id: tag.id,
			name: tag.name ?? '',
			slug: tag.slug ?? '',
		})) ?? []

	return (
		<>
			{breadcrumbsItems.length > 0 && <Breadcrumbs items={breadcrumbsItems} />}

			<Section>
				<Container>
					<div className="space-y-8">
						<Prose>
							<h1 className="text-center">
								<Balancer>{t('etfs_title')}</Balancer>
							</h1>
							<p className="text-center">
								<Balancer>{t('etfs_subtitle')}</Balancer>
							</p>
						</Prose>

						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								{t('search_results_title', { count: 10 })}
								{search && ` ${t('search_results_subtitle')}`}
							</p>

							<SearchInput defaultValue={search} />

							<FilterEtfs tags={tags} categories={categories} selectedTag={tag} selectedCategory={category} />
						</div>

						{etfs && etfs.length > 0 ? (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
								{etfs.map(({ id, uri, title, cptEtfs }) => (
									<Card key={id} className="p-4">
										<div className="flex flex-col gap-1">
											<h2 className="text-xl font-bold">{cptEtfs?.symbol}</h2>
											<p className="text-sm text-muted-foreground">{title}</p>
										</div>

										<Button
											size="lg"
											asChild
											className="mt-auto w-full border bg-primary/30 font-bold text-primary hover:text-primary-foreground"
										>
											<Link href={uri ?? ''} locale={locale}>
												Go to Calculator
											</Link>
										</Button>
									</Card>
								))}
							</div>
						) : (
							<div className="flex h-24 w-full items-center justify-center rounded-lg border bg-accent/25">
								<p>No posts found</p>
							</div>
						)}

						{totalPages > 1 && (
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											className={pageNumber <= 1 ? 'pointer-events-none opacity-50' : ''}
											href={createPaginationUrl(pageNumber - 1)}
										/>
									</PaginationItem>

									<PaginationItem>
										<PaginationLink href={createPaginationUrl(1)} isActive={1 === pageNumber}>
											{1}
										</PaginationLink>
									</PaginationItem>

									<div
										className="relative mx-2 flex overflow-hidden"
										style={{ width: (nbNumberDisplayed - 2) * 40 + addGap * 2, height: 40 }}
									>
										<div
											className="absolute flex gap-1 transition-transform"
											style={{
												transform: `translateX(-${numbersTranslation * (40 + addGap)}px)`,
											}}
										>
											{createNumberList(2, totalPages - 1).map(pageNum => (
												<PaginationItem key={pageNum}>
													<PaginationLink href={createPaginationUrl(pageNum)} isActive={pageNum === pageNumber}>
														{pageNum}
													</PaginationLink>
												</PaginationItem>
											))}
										</div>
									</div>

									<PaginationItem>
										<PaginationLink href={createPaginationUrl(totalPages)} isActive={totalPages === pageNumber}>
											{totalPages}
										</PaginationLink>
									</PaginationItem>

									<PaginationItem>
										<PaginationNext
											className={pageNumber >= totalPages ? 'pointer-events-none opacity-50' : ''}
											href={createPaginationUrl(pageNumber + 1)}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						)}
					</div>
				</Container>
			</Section>
		</>
	)
}
