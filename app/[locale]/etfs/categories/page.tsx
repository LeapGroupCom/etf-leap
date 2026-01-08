import { Breadcrumbs } from '@/components/breadcrumbs'
import { Container, Prose, Section } from '@/components/craft'
import { Badge } from '@/components/ui/badge'
import { GetEtfCategoriesDocument, GetPageDocument, LanguageCodeEnum } from '@/graphql/generated/graphql'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { isNullish } from '@/utils/types'
import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import Balancer from 'react-wrap-balancer'

type Props = {
	searchParams: Promise<{
		page?: string
	}>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
	const { page: pageParam } = await searchParams
	const isIndex = isNullish(pageParam)

	const locale = await getLocale()

	const pageData = await fetchGraphQL(
		GetPageDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			path: '/categories',
		},
		{
			tags: ['etfs-categories-page'],
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

export default async function Page({}: PageProps<'/[locale]/etfs/categories'>) {
	const locale = await getLocale()

	const pageData = await fetchGraphQL(
		GetPageDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			path: '/categories',
		},
		{
			tags: ['etfs-categories-page'],
		}
	)

	const categoriesData = await fetchGraphQL(
		GetEtfCategoriesDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
		},
		{
			tags: [`etf-categories`],
		}
	)

	const categories = categoriesData?.etfCategories?.nodes ?? []
	const breadcrumbs = pageData?.page?.translation?.seo?.breadcrumbs ?? []

	const breadcrumbsItems = breadcrumbs.map(breadcrumb => ({
		text: breadcrumb?.text ?? '',
		url: breadcrumb?.url ?? '',
	}))

	return (
		<>
			{breadcrumbsItems.length > 0 && <Breadcrumbs items={breadcrumbsItems} />}

			<Section>
				<Container>
					<div className="space-y-15">
						<Prose>
							<h1 className="text-center">
								<Balancer>{pageData.page?.translation?.title}</Balancer>
							</h1>
						</Prose>

						<div className="flex flex-wrap items-center justify-center gap-4">
							{categories.map(category => (
								<Badge key={category.id} variant="outline" asChild>
									<Link
										href={{
											pathname: `/etfs/categories/${category.slug}`,
										}}
										className="text-lg!"
									>
										{category.name}
									</Link>
								</Badge>
							))}
						</div>
					</div>
				</Container>
			</Section>
		</>
	)
}
