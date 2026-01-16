import { clientEnv } from '@/clientEnv'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Container, Prose, Section } from '@/components/craft'
import { EtfCalculatorClient } from '@/components/etf-calculator/etf-calculator-client'
import { EtfCalcStoreProvider } from '@/components/etf-calculator/provider'
import { Faq } from '@/components/faq'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GetAllEtfsLocalesDocument, GetEtfBySlugDocument, LanguageCodeEnum } from '@/graphql/generated/graphql'
import { generateEtfFaqItems } from '@/lib/faq'
import { cn } from '@/lib/utils'
import { serverEnv } from '@/serverEnv'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { isNotEmpty, isNotNullish } from '@/utils/types'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from 'react-schemaorg'
import Balancer from 'react-wrap-balancer'
import { FinancialProduct, WebApplication } from 'schema-dts'

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

	const index = etf.seo?.metaRobotsNoindex === 'index' ? true : false
	const follow = etf.seo?.metaRobotsNofollow === 'follow' ? true : false

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
		robots: {
			index,
			follow,
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

	const estDividendYield = etf.cptEtfs?.yield ?? 0
	const estTotalReturn = etf.cptEtfs?.tenYearReturn ?? 0
	const expenseRatio = etf.cptEtfs?.annualReportExpenseRatio ?? 0
	const dividends =
		etf.cptEtfs?.dividends?.filter(isNotNullish).map(d => ({
			date: d.date ?? '',
			amount: d.amount ?? 0,
		})) ?? []
	const holdings =
		etf.cptEtfs?.holdings?.filter(isNotNullish).map(h => ({
			companyName: h.companyName ?? '',
			assetsPercent: h.assetsPercent ?? 0,
			symbol: h.symbol ?? '',
		})) ?? []

	const faqItems = generateEtfFaqItems({ ticker, tenYearReturn: estTotalReturn, dividends, holdings })

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

					<div className="mt-12">
						<EtfCalcStoreProvider serverSideData={{ estTotalReturn, estDividendYield, ticker, expenseRatio }}>
							<EtfCalculatorClient />
						</EtfCalcStoreProvider>
					</div>

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

					{pageContent && (
						<div className="mt-12">
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
						</div>
					)}

					<Faq items={faqItems} />
				</Container>
			</Section>

			<JsonLd<WebApplication>
				item={{
					'@context': 'https://schema.org',
					'@type': 'WebApplication',
					name: etf.title!,
					description: `Calculates the potential future value of an investment in the ${etf.title} based on user-defined inputs for initial investment, regular contributions, and estimated annual growth rate. It also provides historical estimates, showing how much an investor would have earned by starting at different points in the past.`,
					applicationCategory: 'FinanceApplication',
					operatingSystem: 'Web-based',
					provider: {
						'@type': 'Organization',
						name: 'ETFLeap.com',
						url: clientEnv.NEXT_PUBLIC_SITE_URL,
					},
				}}
			/>

			<JsonLd<FinancialProduct>
				item={{
					'@context': 'https://schema.org',
					'@type': 'FinancialProduct',
					name: etf.title!,
				}}
			/>
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
