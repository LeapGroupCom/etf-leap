import { yahooFinance } from '@/lib/yahoo-finance'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

export const maxDuration = 30

const bodySchema = z.object({
	tickers: z.array(z.string()),
})

export async function POST(request: NextRequest) {
	try {
		const bodyResult = bodySchema.safeParse(await request.json())

		if (!bodyResult.success) {
			return NextResponse.json(bodyResult.error, { status: 400 })
		}

		const { tickers } = bodyResult.data

		const res = await Promise.all(
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

		const result = parseGlobMarketData(res)

		return NextResponse.json(result, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
			},
		})
	} catch (err) {
		console.error(err)
		return NextResponse.json({
			estDividendYield: 0,
			estTotalReturn: 0,
			expenseRatio: 0,
		})
	}
}

function parseGlobMarketData(
	tickerData: Array<{
		ticker: string
		chart: Array<{
			date: Date
			volume: number | null
			open: number | null
			high: number | null
			low: number | null
			close: number | null
			adjclose?: number | null
		}>
	}>
): Array<{
	date: string
	[ticker: string]: string | number
}> {
	// Get all unique dates from all tickers
	const allDates = new Set<string>()

	tickerData.forEach(({ chart }) => {
		chart.forEach(({ date }) => {
			const dateStr =
				date instanceof Date ? date.toISOString().split('T')[0] : new Date(date).toISOString().split('T')[0]
			allDates.add(dateStr)
		})
	})

	// Sort dates
	const sortedDates = Array.from(allDates).sort()

	// Create result array
	const result = sortedDates.map(date => {
		const dataPoint: { date: string; [ticker: string]: string | number } = { date }

		tickerData.forEach(({ ticker, chart }) => {
			// Find volume for this ticker on this date
			const dayData = chart.find(item => {
				const itemDateStr =
					item.date instanceof Date
						? item.date.toISOString().split('T')[0]
						: new Date(item.date).toISOString().split('T')[0]
				return itemDateStr === date
			})

			// Use ticker name in lowercase as key and set volume (default to 0 if not found)
			dataPoint[ticker.toLowerCase()] = dayData?.adjclose || (0 as number)
		})

		return dataPoint
	})

	return result
}
