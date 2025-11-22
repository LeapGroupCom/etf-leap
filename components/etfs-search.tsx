'use client'

import { useDebouncedValue } from '@/hooks/use-debounce'
import { SearchResultItem } from '@/utils/search'
import { useQuery } from '@tanstack/react-query'
import { XIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { match, P } from 'ts-pattern'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'

export const EtfsSearch = () => {
	const t = useTranslations()
	const locale = useLocale()

	const form = useForm<{ search: string }>({
		defaultValues: {
			search: '',
		},
		mode: 'onChange',
	})

	const { watch } = form

	const search = watch('search')
	const searchValue = useDebouncedValue(search, 300)

	const { data: searchResult, isLoading } = useQuery<SearchResultItem[]>({
		queryKey: ['etfs-search', searchValue, locale],
		queryFn: async () => {
			const response = await fetch('/api/search/etfs', {
				method: 'POST',
				body: JSON.stringify({ search: searchValue, locale }),
			})

			return response.json()
		},
		enabled: !!searchValue.length,
	})

	return (
		<Dialog>
			<DialogTrigger className="w-full">
				<Input
					type="text"
					name="search"
					placeholder={t('search_placeholder')}
					className="shadow-primary-foreground/30 shadow-sm"
					autoComplete="off"
				/>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader className="space-y-4">
					<DialogTitle>Tell us what you are looking for</DialogTitle>
				</DialogHeader>
				<Controller
					name="search"
					control={form.control}
					render={({ field }) => (
						<div className="relative">
							<Input
								type="text"
								name="search"
								placeholder={t('search_placeholder')}
								value={field.value}
								onChange={field.onChange}
								className="shadow-primary-foreground/30 shadow-sm ring-0! ring-offset-0! outline-none"
								autoComplete="off"
							/>

							{search.length > 0 && (
								<Button
									variant="empty"
									size="empty"
									className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
									onClick={() => form.reset()}
								>
									<XIcon className="text-muted-foreground size-4" />
								</Button>
							)}
						</div>
					)}
				/>

				<div className="shadow-primary-foreground/30 bg-background flex h-full w-full flex-col overflow-hidden rounded-md p-4 shadow-sm sm:max-h-[360px]">
					{match({ isLoading, searchResult })
						.with({ isLoading: true }, () => (
							<div className="flex flex-col gap-4 pt-6">
								{Array(5)
									.fill(null)
									.map((_, index) => (
										<div key={index} className="flex items-center gap-3 rounded-md">
											<Skeleton className="bg-primary/10 h-12 w-12 flex-shrink-0 rounded" />
											<div className="flex-1 space-y-2">
												<Skeleton className="bg-primary/10 h-4 w-3/4" />
												<Skeleton className="bg-primary/10 h-3 w-1/2" />
											</div>
										</div>
									))}
							</div>
						))
						.with({ isLoading: false, searchResult: P.nullish }, () => (
							<div className="text-muted-foreground flex h-full flex-col items-center justify-center text-center">
								<p className="mb-1 text-sm font-medium">{t('etfs_search_title')}</p>
								<p className="text-muted-foreground/80 text-xs">{t('etfs_search_subtitle')}</p>
							</div>
						))
						.with({ isLoading: false, searchResult: [] }, () => (
							<div className="text-muted-foreground flex h-full flex-col items-center justify-center text-center">
								<p className="mb-1 text-sm font-medium">{t('etfs_search_empty_title')}</p>
								<p className="text-muted-foreground/80 text-xs">{t('etfs_search_empty_subtitle')}</p>
							</div>
						))
						.with({ isLoading: false, searchResult: [P.any, ...P.array()] }, ({ searchResult }) => (
							<div className="flex h-full flex-col">
								<div className="text-muted-foreground pb-2 text-xs">
									{t('search_results_title', { count: searchResult.length })}
								</div>

								<div className="-mr-2 flex h-full flex-col gap-4 overflow-y-scroll pr-2">
									{searchResult.map(etf => (
										<Link
											key={etf.id}
											href={{
												pathname: etf.uri,
											}}
											className="group flex items-center gap-3 rounded-md transition-colors"
										>
											<div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
												{etf.ticker && <span className="text-sm">{etf.ticker}</span>}
											</div>

											<div className="min-w-0 flex-1">
												<p className="group-hover:text-primary truncate text-sm font-medium transition-colors">
													{etf.title}
												</p>
												<p className="text-muted-foreground truncate text-xs">{etf.slug}</p>
											</div>

											<svg
												className="text-muted-foreground h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</Link>
									))}
								</div>
							</div>
						))
						.otherwise(() => null)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
