import { Container, Prose, Section } from '@/components/craft'

import { GetPageDocument, LanguageCodeEnum } from '@/graphql/generated/graphql'
import { serverEnv } from '@/serverEnv'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Revalidate pages every hour
export const revalidate = 3600

// export async function generateStaticParams() {
// 	const data = await fetchGraphQL(GetAllPagesDocument)

// 	const pages = data?.pages?.nodes ?? []

// 	console.log('pages', pages);

// 	// if (pages.length === 0) {
// 		return []
// 	// }

// 	return pages
// 		?.filter(page => page.slug !== 'home')
// 		.map(page => ({
// 			slug: page.slug,
// 		}))
// }

export async function generateMetadata({ params }: PageProps<'/[locale]/[...slug]'>): Promise<Metadata> {
	const { slug } = await params
	const locale = await getLocale()
	const data = await fetchGraphQL(GetPageDocument, {
		path: slug.join('/'),
		locale: locale.toUpperCase() as LanguageCodeEnum,
	})

	if (!data || !data?.page?.translation) {
		return {}
	}

	const page = data?.page?.translation

	const ogUrl = new URL(`${serverEnv.NEXT_PUBLIC_SITE_URL}/api/og`)
	ogUrl.searchParams.append('title', page.title ?? '')
	// Strip HTML tags for description and limit length
	const description =
		page.content
			?.replace(/<[^>]*>/g, '')
			.trim()
			.slice(0, 200) + '...'
	ogUrl.searchParams.append('description', description)

	return {
		title: page.title ?? '',
		description: description,
		openGraph: {
			title: page.title ?? '',
			description: description,
			type: 'article',
			url: `${serverEnv.NEXT_PUBLIC_SITE_URL}${page.uri}`,
			images: [
				{
					url: ogUrl.toString(),
					width: 1200,
					height: 630,
					alt: page.title ?? '',
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: page.title ?? '',
			description: description,
			images: [ogUrl.toString()],
		},
	}
}

export default async function Page({ params }: PageProps<'/[locale]/[...slug]'>) {
	const { slug } = await params
	const locale = await getLocale()

	const data = await fetchGraphQL(GetPageDocument, {
		path: slug.join('/'),
		locale: locale.toUpperCase() as LanguageCodeEnum,
	})

	if (!data || !data?.page?.translation) {
		return notFound()
	}

	const page = data?.page?.translation

	return (
		<Section>
			<Container>
				<Prose>
					<h2>{page.title}</h2>
					<div dangerouslySetInnerHTML={{ __html: page.content ?? '' }} />
				</Prose>
			</Container>
		</Section>
	)
}
