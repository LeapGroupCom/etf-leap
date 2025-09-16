import { yahooFinance } from '@/lib/yahoo-finance'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

export const maxDuration = 30

/**
 * WordPress webhook handler for content revalidation
 * Receives notifications from WordPress when content changes
 * and revalidates the entire site
 */

const bodySchema = z.object({
	ticker: z.string(),
	startDate: z.string(),
	endDate: z.string(),
})

export async function POST(request: NextRequest) {
	try {
		const bodyResult = bodySchema.safeParse(await request.json())

		if (!bodyResult.success) {
			return NextResponse.json(bodyResult.error, { status: 400 })
		}
		const { ticker, startDate, endDate } = bodyResult.data

		// Fetch daily prices and dividend events via chart API
		const chart = await yahooFinance.chart(ticker, {
			period1: startDate,
			period2: endDate,
			interval: '1d',
			events: 'div',
		})

		const prices = (chart?.quotes || []).map(q => ({
			date: q.date ?? new Date(),
			open: q.open ?? 0,
			high: q.high ?? 0,
			low: q.low ?? 0,
			close: q.close ?? 0,
			adjClose: q.adjclose ?? q.close ?? 0,
			volume: q.volume ?? 0,
		}))

		const dividends = Object.values(chart?.events?.dividends || {}).map((d: any) => {
			const sec = d?.date ?? d?.timestamp
			const ms = typeof sec === 'number' ? sec * 1000 : Date.parse(sec)
			return {
				date: new Date(ms).toISOString(),
				amount: d?.amount ?? 0,
			}
		})

		const payload = { prices, dividends }

		return new NextResponse(JSON.stringify(payload), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
			},
		})
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: (error as Error).message }, { status: 500 })
	}
}
