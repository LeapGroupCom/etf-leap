'use client'

import { FilterEtfs } from '@/components/etfs-filter'
import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { GetAllEtfsCategoriesQuery, GetAllEtfsQuery, GetAllEtfsTagsQuery } from '@/graphql/generated/graphql'
import { Link } from '@/i18n/navigation'
import { clamp } from '@/utils/math'
import { createNumberList } from '@/utils/pagination'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { match, P } from 'ts-pattern'

export const PAGE_SIZE_ETFS = 24
export const NB_MAX_PAGES = 5
export const STALE_TIME = 1000 * 60 * 5 // 5 minutes

// export function PageClient({
// 	promise,
// }: {
// 	promise: Promise<[GetAllEtfsQuery, GetAllEtfsCategoriesQuery, GetAllEtfsTagsQuery]>
// }) {
// 	const locale = useLocale()
// 	const searchParams = useSearchParams()
// 	const t = useTranslations()

// 	const search = searchParams.get('search') ?? ''
// 	const category = searchParams.get('category') ?? ''
// 	const tag = searchParams.get('tag') ?? ''
// 	const pageParam = searchParams.get('page')
// 	const pageNumber = pageParam ? parseInt(pageParam, 10) : 1

// 	const [etfsData, categoriesData, tagsData] = use(promise)

// 	const { data, isLoading } = useQuery({
// 		queryKey: ['etfs'],
// 		queryFn: () => promise,
// 	})

// 	console.log('data ', data)

// 	const etfs = etfsData?.etfs?.nodes
// 	const totalPages = Math.ceil(
// 		(etfsData.etfs?.pageInfo.offsetPagination?.total ?? etfs?.length ?? PAGE_SIZE_ETFS) / PAGE_SIZE_ETFS
// 	)

// 	const nbNumberDisplayed = Math.min(totalPages, NB_MAX_PAGES)
// 	const nbMaxTranslations = Math.max(totalPages - NB_MAX_PAGES, 0)
// 	const numbersTranslation = clamp(0, nbMaxTranslations, pageNumber - Math.ceil(NB_MAX_PAGES / 2))
// 	const addGap = totalPages > 3 ? 4 : 0

// 	// Create pagination URL helper
// 	const createPaginationUrl = (newPage: number) => {
// 		const params = new URLSearchParams()
// 		if (newPage > 1) params.set('page', newPage.toString())
// 		if (category) params.set('category', category)
// 		if (tag) params.set('tag', tag)
// 		if (search) params.set('search', search)
// 		return `/etfs${params.toString() ? `?${params.toString()}` : ''}`
// 	}

// 	const categories =
// 		categoriesData?.etfCategories?.nodes.map(category => ({
// 			id: category.id,
// 			name: category.name ?? '',
// 			slug: category.slug ?? '',
// 		})) ?? []
// 	const tags =
// 		tagsData?.etfTags?.nodes.map(tag => ({
// 			id: tag.id,
// 			name: tag.name ?? '',
// 			slug: tag.slug ?? '',
// 		})) ?? []

// 	return (
// 		<>
// 			<div className="space-y-4">
// 				<p className="text-muted-foreground text-sm">
// 					{t('search_results_title', { count: etfs?.length ?? 0 })}
// 					{search && ` ${t('search_results_subtitle')}`}
// 				</p>

// 				<SearchInput defaultValue={search} />

// 				<FilterEtfs tags={tags} categories={categories} selectedTag={tag} selectedCategory={category} />
// 			</div>

// 			{etfs && etfs.length > 0 ? (
// 				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
// 					{etfs.map(({ id, uri, title, cptEtfs }) => (
// 						<Card key={id} className="h-[180px] p-4">
// 							<div className="flex flex-col gap-1">
// 								<h2 className="text-xl font-bold">{cptEtfs?.symbol}</h2>
// 								<p className="text-muted-foreground text-sm">{title}</p>
// 							</div>

// 							<Button
// 								size="lg"
// 								asChild
// 								className="bg-primary/30 text-primary hover:text-primary-foreground mt-auto w-full border font-bold"
// 							>
// 								<Link href={uri ?? ''} locale={locale}>
// 									Go to Calculator
// 								</Link>
// 							</Button>
// 						</Card>
// 					))}
// 				</div>
// 			) : (
// 				<div className="bg-accent/25 flex h-24 w-full items-center justify-center rounded-lg border">
// 					<p>No posts found</p>
// 				</div>
// 			)}

// 			{totalPages > 1 && (
// 				<Pagination>
// 					<PaginationContent>
// 						<PaginationItem>
// 							<PaginationPrevious
// 								className={pageNumber <= 1 ? 'pointer-events-none opacity-50' : ''}
// 								href={createPaginationUrl(pageNumber - 1)}
// 							/>
// 						</PaginationItem>

// 						<PaginationItem>
// 							<PaginationLink href={createPaginationUrl(1)} isActive={1 === pageNumber}>
// 								{1}
// 							</PaginationLink>
// 						</PaginationItem>

// 						<div
// 							className="relative mx-2 flex overflow-hidden"
// 							style={{ width: (nbNumberDisplayed - 2) * 40 + addGap * 2, height: 40 }}
// 						>
// 							<div
// 								className="absolute flex gap-1 transition-transform"
// 								style={{
// 									transform: `translateX(-${numbersTranslation * (40 + addGap)}px)`,
// 								}}
// 							>
// 								{createNumberList(2, totalPages - 1).map(pageNum => (
// 									<PaginationItem key={pageNum}>
// 										<PaginationLink href={createPaginationUrl(pageNum)} isActive={pageNum === pageNumber}>
// 											{pageNum}
// 										</PaginationLink>
// 									</PaginationItem>
// 								))}
// 							</div>
// 						</div>

// 						<PaginationItem>
// 							<PaginationLink href={createPaginationUrl(totalPages)} isActive={totalPages === pageNumber}>
// 								{totalPages}
// 							</PaginationLink>
// 						</PaginationItem>

// 						<PaginationItem>
// 							<PaginationNext
// 								className={pageNumber >= totalPages ? 'pointer-events-none opacity-50' : ''}
// 								href={createPaginationUrl(pageNumber + 1)}
// 							/>
// 						</PaginationItem>
// 					</PaginationContent>
// 				</Pagination>
// 			)}
// 		</>
// 	)
// }

export function PageClientQuery({
	promise,
}: {
	promise: Promise<[GetAllEtfsQuery, GetAllEtfsCategoriesQuery, GetAllEtfsTagsQuery]>
}) {
	const locale = useLocale()
	const searchParams = useSearchParams()
	const t = useTranslations()

	const search = searchParams.get('search') ?? ''
	const category = searchParams.get('category') ?? ''
	const tag = searchParams.get('tag') ?? ''
	const pageParam = searchParams.get('page')
	const pageNumber = pageParam ? parseInt(pageParam, 10) : 1

	const { data, isLoading } = useQuery({
		queryKey: ['etfs', search, category, tag, pageNumber],
		queryFn: () => promise,
		placeholderData: keepPreviousData,
		staleTime: STALE_TIME
	})

	const [etfsData, categoriesData, tagsData] = data || []

	const etfs = etfsData?.etfs?.nodes
	const totalPages = Math.ceil(
		(etfsData?.etfs?.pageInfo.offsetPagination?.total ?? etfs?.length ?? PAGE_SIZE_ETFS) / PAGE_SIZE_ETFS
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
			<div className="space-y-4">
				{isLoading ? (
					<Skeleton className="bg-card h-[14px] w-24" />
				) : (
					<>
						<p className="text-muted-foreground text-sm leading-none">
							{t('search_results_title', { count: etfs?.length ?? 0 })}
							{search && ` ${t('search_results_subtitle')}`}
						</p>
					</>
				)}

				<SearchInput defaultValue={search} />

				<FilterEtfs tags={tags} categories={categories} selectedTag={tag} selectedCategory={category} />
			</div>

			{match({ etfs, isLoading })
				.with({ isLoading: true, etfs: P.nullish }, () => (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{Array(PAGE_SIZE_ETFS)
							.fill(null)
							.map((_, index) => (
								<Card key={index} className="h-[180px] bg-transparent p-0">
									<Skeleton className="bg-card h-full w-full" />
								</Card>
							))}
					</div>
				))
				.with({ isLoading: false, etfs: [] }, () => (
					<div className="bg-accent/25 flex h-24 w-full items-center justify-center rounded-lg border">
						<p>No posts found</p>
					</div>
				))
				.with({ isLoading: false, etfs: P.array() }, ({ etfs }) => (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{etfs.map(({ id, uri, title, cptEtfs }) => (
							<Card key={id} className="h-[180px] p-4">
								<div className="flex flex-col gap-1">
									<h2 className="text-xl font-bold">{cptEtfs?.symbol}</h2>
									<p className="text-muted-foreground text-sm">{title}</p>
								</div>

								<Button
									size="lg"
									asChild
									className="bg-primary/30 text-primary hover:text-primary-foreground mt-auto w-full border font-bold"
								>
									<Link href={uri ?? ''} locale={locale}>
										Go to Calculator
									</Link>
								</Button>
							</Card>
						))}
					</div>
				))
				.otherwise(() => null)}

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
		</>
	)
}
