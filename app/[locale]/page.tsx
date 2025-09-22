import { CalculatorsCarousel, EtfSliderItem } from '@/components/calculators-carousel'
import { ChartGlobMarket } from '@/components/charts/glob-market'
import { Box, Container } from '@/components/craft'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GetPageDocument, LanguageCodeEnum } from '@/graphql/generated/graphql'
import { Link } from '@/i18n/navigation'
import { yahooFinance } from '@/lib/yahoo-finance'
import HeroImage from '@/public/hero-image.webp'
import { serverEnv } from '@/serverEnv'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { parseHtml } from '@/utils/parser'
import { isNotEmpty, isNotNullish } from '@/utils/types'
import { TrendingUp } from 'lucide-react'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Balancer from 'react-wrap-balancer'

export async function generateMetadata(props: Omit<LayoutProps<'/[locale]'>, 'children'>) {
	const { locale } = await props.params

	const pageData = await fetchGraphQL(
		GetPageDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			path: '/',
		},
		{
			tags: ['home'],
		}
	)

	const seo = pageData?.page?.translation?.seo

	return {
		title: seo?.title ?? '',
		description: seo?.metaDesc ?? '',
		metadataBase: new URL(serverEnv.NEXT_PUBLIC_SITE_URL),
		robots: {
			index: seo?.metaRobotsNoindex === 'index' ? true : false,
			follow: seo?.metaRobotsNofollow === 'follow' ? true : false,
		},
		alternates: {
			canonical: seo?.canonical ?? '/',
		},
	}
}

export default async function Home({ params }: PageProps<'/[locale]'>) {
	const { locale } = await params
	setRequestLocale(locale as Locale)
	const t = await getTranslations()

	const { page } = await fetchGraphQL(
		GetPageDocument,
		{
			locale: locale.toUpperCase() as LanguageCodeEnum,
			path: '/',
		},
		{ tags: ['home'] }
	)

	const pageHome = page?.translation?.pageHome

	if (!pageHome) {
		return notFound()
	}

	const sliderEtfs: EtfSliderItem[] =
		pageHome.sliderEtfs?.nodes
			?.filter(etf => etf.__typename === 'Etf')
			.map(etf => ({
				symbol: etf?.cptEtfs?.symbol ?? '',
				title: etf?.title ?? '',
				uri: etf?.uri ?? '',
			})) ?? []

	return (
		<>
			<main>
				{/* Hero Section */}
				<section className="hero-section md:pt-24 md:pb-16 py-8">
					<Image
						priority
						alt="Hero Image"
						src={HeroImage}
						fill
						className="absolute inset-0 z-[-1] h-full w-full object-cover"
					/>
					<Container>
						<Box direction="col" className="items-center">
							<h1 className="w-4/5 text-center text-4xl font-bold leading-tight md:text-6xl">
								<Balancer>{pageHome.title}</Balancer>
							</h1>

							<p className="mb-4 mt-6 text-center text-base leading-6 md:text-lg md:leading-8">
								<Balancer>{pageHome.subTitle}</Balancer>
							</p>
						</Box>
					</Container>

					<Container className="w-full p-6 xs:pr-0">
						<CalculatorsCarousel etfs={sliderEtfs} />
					</Container>

					{isNotNullish(pageHome?.heroViewAllButtonLink?.nodes?.[0]?.uri) && (
						<Button size="lg" className="font-bold">
							<Link href={pageHome.heroViewAllButtonLink.nodes[0].uri}>{t('home_view_all_etfs_button_text')}</Link>
						</Button>
					)}
				</section>

				{/* Why Invest Section */}
				<section className="py-8 md:py-14">
					<Container className="flex flex-col items-center">
						<h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">
							<Balancer>{pageHome.whyInvestTitle}</Balancer>
						</h2>

						{isNotNullish(pageHome.whyInvestSubtitle) && isNotEmpty(pageHome.whyInvestSubtitle) && (
							<div className="mb-10 text-center text-base leading-6 text-muted-foreground md:text-lg">
								<Balancer>{parseHtml(pageHome.whyInvestSubtitle)}</Balancer>
							</div>
						)}

						{isNotNullish(pageHome.whyInvestCards) && !!pageHome.whyInvestCards.length && (
							<Box gap={6} className="flex-col lg:flex-row">
								{pageHome.whyInvestCards.map((card, index) => (
									<Card
										key={index}
										className="select-none gap-4 border p-5 transition-all duration-300 hover:border-primary"
									>
										<div className="flex items-center justify-center">
											<TrendingUp size={48} className="text-primary" />
										</div>

										<h3 className="text-center text-xl font-bold md:text-2xl">
											<Balancer>{card?.title}</Balancer>
										</h3>

										{isNotNullish(card?.content) && isNotEmpty(card?.content) && (
											<div className="text-center text-sm text-muted-foreground md:text-base">
												<Balancer>{parseHtml(card.content)}</Balancer>
											</div>
										)}
									</Card>
								))}
							</Box>
						)}

						{isNotNullish(pageHome.whyInvestButtonLink) && isNotNullish(pageHome.whyInvestButtonLink.url) && (
							<Button size="lg" className="mx-auto mt-8 font-bold">
								<Link href={pageHome.whyInvestButtonLink.url}>Build Your Strategy</Link>
							</Button>
						)}
					</Container>
				</section>

				{/* Market Performance Section */}
				<MarketPerformance
					title={pageHome.marketPerfTitle}
					subTitle={pageHome.marketPerfSubTitle}
					etfs={pageHome.marketPerfMarketSymbol?.map(symbol => symbol?.etf?.nodes[0] ?? []) ?? []}
				/>

				{/* Broker Picks Section */}
				<section className="py-8 md:py-14">
					<Container className="flex flex-col items-center">
						{isNotNullish(pageHome.brokerPicksTitle) && isNotEmpty(pageHome.brokerPicksTitle) && (
							<h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">
								<Balancer>{pageHome.brokerPicksTitle}</Balancer>
							</h2>
						)}

						{isNotNullish(pageHome.brokerPicksSubTitle) && isNotEmpty(pageHome.brokerPicksSubTitle) && (
							<div className="mb-10 text-center text-base leading-6 text-muted-foreground md:text-lg">
								<Balancer>{parseHtml(pageHome.brokerPicksSubTitle)}</Balancer>
							</div>
						)}

						{isNotNullish(pageHome.brokerPicksBrokers) && !!pageHome.brokerPicksBrokers.length && (
							<Box gap={6} cols={12}>
								{pageHome.brokerPicksBrokers.map((broker, index) => (
									<Card key={index} className="col-span-12 gap-4 p-5 sm:col-span-6 md:col-span-4">
										{isNotNullish(broker?.title) && isNotEmpty(broker?.title) && (
											<h3 className="text-center text-xl font-bold md:text-2xl">
												<Balancer>{broker.title}</Balancer>
											</h3>
										)}

										{isNotNullish(broker?.content) && isNotEmpty(broker?.content) && (
											<div className="text-center text-sm text-muted-foreground md:text-base">
												<Balancer>{parseHtml(broker.content)}</Balancer>
											</div>
										)}

										{isNotNullish(broker?.buttonLink) && isNotNullish(broker?.buttonLink.url) && (
											<Button
												size="lg"
												asChild
												className="mt-auto w-full border bg-primary/30 font-bold text-primary hover:text-primary-foreground"
											>
												<Link href={broker.buttonLink.url}>Visit Site</Link>
											</Button>
										)}
									</Card>
								))}
							</Box>
						)}
					</Container>
				</section>

				{/* How to Start Section */}
				<section className="py-8 md:py-14">
					<Container className="flex flex-col items-center">
						{isNotNullish(pageHome.howToStartTitle) && isNotEmpty(pageHome.howToStartTitle) && (
							<h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">
								<Balancer>{pageHome.howToStartTitle}</Balancer>
							</h2>
						)}

						{isNotNullish(pageHome.howToStartCards) && !!pageHome.howToStartCards.length && (
							<Box cols={12} wrap="wrap" className="relative gap-y-8 sm:gap-x-8">
								<div
									className="absolute left-0 top-1/2 z-[-1] hidden h-0.5 w-full border-t-2 border-dashed border-gray-600 md:block"
									style={{ transform: 'translateY(-50%)' }}
								/>
								{pageHome.howToStartCards.map((card, index) => (
									<Card
										key={index}
										className="relative col-span-12 gap-4 p-5 sm:col-span-6 sm:last:col-start-4 md:col-span-4 md:last:col-start-auto"
									>
										<div className="absolute -left-5 -top-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
											{index + 1}
										</div>

										{isNotNullish(card?.title) && isNotEmpty(card?.title) && (
											<h3 className="text-center text-xl font-bold md:text-2xl">
												<Balancer>{card.title}</Balancer>
											</h3>
										)}

										{isNotNullish(card?.content) && isNotEmpty(card?.content) && (
											<div className="text-center text-sm text-muted-foreground md:text-base">
												<Balancer>{parseHtml(card.content)}</Balancer>
											</div>
										)}
									</Card>
								))}
							</Box>
						)}
					</Container>
				</section>
			</main>
		</>
	)
}

type MarketPerformanceProps = {
	title: string | null
	subTitle: string | null
	etfs?: any[]
}

const MarketPerformance = ({ title, subTitle, etfs }: MarketPerformanceProps) => {
	const tickers = etfs!.map(ticker => ticker.cptEtfs.symbol)

	const result = Promise.all(
		tickers.map(ticker =>
			yahooFinance
				.chart(ticker, {
					period1: new Date('2020-01-01'),
					period2: new Date(),
					interval: '1mo',
				})
				.then(chart => ({ ticker, chart: chart.quotes }))
		)
	)

	const etfsDetails =
		etfs?.map(etf => ({
			symbol: etf.cptEtfs.symbol,
			title: etf.title,
		})) ?? []

	return (
		<section className="py-8 md:py-14">
			<Container>
				{isNotNullish(title) && isNotEmpty(title) && (
					<h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">
						<Balancer>{title}</Balancer>
					</h2>
				)}

				{isNotNullish(subTitle) && isNotEmpty(subTitle) && (
					<div className="mb-10 text-center text-base leading-6 text-muted-foreground md:text-lg">
						<Balancer>{parseHtml(subTitle)}</Balancer>
					</div>
				)}

				<Suspense
					fallback={
						<Card className="py-2 md:py-5">
							<CardContent className="h-[200px] px-2 sm:h-[350px] md:h-[500px] md:px-5 lg:h-[600px]" />
						</Card>
					}
				>
					<ChartGlobMarket dataPromise={result} etfsDetails={etfsDetails} />
				</Suspense>
			</Container>
		</section>
	)
}
