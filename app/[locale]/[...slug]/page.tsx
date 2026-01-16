import { Container, Prose, Section } from '@/components/craft'

import { GetPageDocument, LanguageCodeEnum } from '@/graphql/generated/graphql'
import { serverEnv } from '@/serverEnv'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Revalidate pages every hour
export const revalidate = 3600

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
	ogUrl.searchParams.append('title', page.seo?.title ?? '')
	// Strip HTML tags for description
	const description = page.seo?.metaDesc?.replace(/<[^>]*>/g, '').trim()
	ogUrl.searchParams.append('description', description ?? '')

	const index = page.seo?.metaRobotsNoindex === 'index' ? true : false
	const follow = page.seo?.metaRobotsNofollow === 'follow' ? true : false

	return {
		title: page.seo?.title ?? '',
		description: page.seo?.metaDesc ?? '',
		openGraph: {
			title: page.seo?.title ?? '',
			description: page.seo?.metaDesc ?? '',
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
			title: page.seo?.title ?? '',
			description: page.seo?.metaDesc ?? '',
			images: [ogUrl.toString()],
		},
		robots: {
			index,
			follow,
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

	if (!data || !data?.page?.translation || data.page.translation.isFrontPage) {
		return notFound()
	}

	const page = data?.page?.translation

	return (
		<Section>
			<Container>
				<Prose>
					<h2>{page.title}</h2>
					<div dangerouslySetInnerHTML={{ __html: page.title ?? '' }} />
				</Prose>
			</Container>
		</Section>
	)
}
