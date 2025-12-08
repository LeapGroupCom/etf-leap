import { Breadcrumbs } from '@/components/breadcrumbs'
import { Container, Prose, Section } from '@/components/craft'
import { EtfCalculator } from '@/components/etf-calculator'
import { EtfCalculatorClientSkeleton } from '@/components/etf-calculator/etf-calculator-client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GetAllEtfsLocalesDocument, GetEtfBySlugDocument, LanguageCodeEnum } from '@/graphql/generated/graphql'
import { cn } from '@/lib/utils'
import { serverEnv } from '@/serverEnv'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { isNotEmpty, isNotNullish } from '@/utils/types'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Balancer from 'react-wrap-balancer'

export async function generateStaticParams() {
	const data = await fetchGraphQL(GetAllEtfsLocalesDocument)

	const etfs = data?.etfs?.nodes

	return (
		etfs?.map(etf => ({
			locale: etf.language?.code?.toLowerCase(),
			etfSlug: etf.slug,
		})) ?? []
	)
}

export async function generateMetadata({ params }: PageProps<'/[locale]/etfs/[etfSlug]'>): Promise<Metadata> {
	const { etfSlug, locale } = await params
	const data = await fetchGraphQL(GetEtfBySlugDocument, {
		slug: etfSlug,
		locale: locale.toUpperCase() as LanguageCodeEnum,
	})
	const etf = data?.etf?.translation

	if (!etf) {
		return {}
	}

	const ogUrl = new URL(`${serverEnv.NEXT_PUBLIC_SITE_URL}/api/og`)
	ogUrl.searchParams.append('title', etf.seo?.title ?? '')
	// Strip HTML tags for description
	const description = etf.seo?.metaDesc?.replace(/<[^>]*>/g, '').trim()
	ogUrl.searchParams.append('description', description ?? '')

	return {
		title: etf.seo?.title ?? '',
		description: etf.seo?.metaDesc ?? '',
		openGraph: {
			title: etf.seo?.title ?? '',
			description: etf.seo?.metaDesc ?? '',
			type: 'article',
			url: `${serverEnv.NEXT_PUBLIC_SITE_URL}${etf.uri}`,
			images: [
				{
					url: ogUrl.toString(),
					width: 1200,
					height: 630,
					alt: etf.seo?.title ?? '',
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: etf.seo?.title ?? '',
			description: etf.seo?.metaDesc ?? '',
			images: [ogUrl.toString()],
		},
	}
}

export default async function Page({ params }: PageProps<'/[locale]/etfs/[etfSlug]'>) {
	const { etfSlug } = await params
	const locale = await getLocale()

	const data = await fetchGraphQL(GetEtfBySlugDocument, {
		slug: etfSlug,
		locale: locale.toUpperCase() as LanguageCodeEnum,
	})
	const etf = data?.etf?.translation

	if (!etf) {
		return notFound()
	}

	const ticker = etf.cptEtfs!.symbol!
	const subtitle =
		isNotNullish(etf.cptEtfContent?.subtitle) && isNotEmpty(etf.cptEtfContent?.subtitle)
			? etf.cptEtfContent?.subtitle
			: null
	const pageContent =
		isNotNullish(etf.cptEtfContent?.content) && isNotEmpty(etf.cptEtfContent?.content)
			? etf.cptEtfContent?.content
			: null

	const breadcrumbsItems =
		etf.seo?.breadcrumbs?.map(breadcrumb => ({
			text: breadcrumb?.text ?? '',
			url: breadcrumb?.url ?? '',
		})) ?? []

	return (
		<>
			{breadcrumbsItems.length > 0 && <Breadcrumbs items={breadcrumbsItems} />}

			<Section>
				<Container>
					<h1 className="text-center">
						<Balancer>{etf.title}</Balancer>
					</h1>

					{subtitle && (
						<p className="mt-6 text-center">
							<Balancer>{subtitle}</Balancer>
						</p>
					)}

					<section className="mt-12">
						<Suspense fallback={<EtfCalculatorClientSkeleton />}>
							<EtfCalculator ticker={ticker} />
						</Suspense>
					</section>

					{!!etf.etfCategories?.nodes?.length && (
						<Card className="mt-6 border-none py-4">
							<CardContent className="flex flex-wrap items-center gap-3">
								{etf.etfCategories?.nodes?.map(category => (
									<Badge key={category.id} variant="outline" className="px-3 py-1" asChild>
										<Link
											href={{
												pathname: `/etfs/categories/${category.slug}`,
											}}
										>
											{category.name}
										</Link>
									</Badge>
								))}
							</CardContent>
						</Card>
					)}

					<div className="mt-12">
						{pageContent && (
							<Prose>
								<div
									id="seo-text"
									className={cn(
										'leading-relaxed',
										'[&_h2]:mb-4 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:text-2xl [&_h2]:font-bold'
									)}
									dangerouslySetInnerHTML={{ __html: pageContent ?? '' }}
								/>
							</Prose>
						)}
					</div>
				</Container>
			</Section>
		</>
	)
}

// const PageAdSection = ({ ticker, locale }: { ticker: string; locale: string }) => {
// 	return (
// 		<div id="cta-broker" className="rounded-2xl bg-accent p-8 text-center text-white shadow-lg">
// 			<h2 className="mb-3 text-3xl font-bold">Ready to Invest in {ticker}?</h2>
// 			<p className="mx-auto mb-6 max-w-2xl text-blue-100">
// 				Open an account with a top-rated online broker to start building your portfolio today. Low fees and easy access
// 				to a wide range of ETFs.
// 			</p>

// 			<Button
// 				size="lg"
// 				asChild
// 				className="mt-auto border bg-secondary font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-secondary"
// 			>
// 				<Link href={'#'}>Open an Account</Link>
// 			</Button>
// 		</div>
// 	)
// }
