import { yahooFinance } from '@/lib/yahoo-finance'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

export const maxDuration = 30

const bodySchema = z.object({
	ticker: z.string(),
})

export async function POST(request: NextRequest) {
	try {
		const bodyResult = bodySchema.safeParse(await request.json())

		if (!bodyResult.success) {
			return NextResponse.json(bodyResult.error, { status: 400 })
		}

		const { ticker } = bodyResult.data
		const { summaryDetail, fundPerformance, fundProfile } = await yahooFinance.quoteSummary(ticker, {
			modules: ['summaryDetail', 'fundPerformance', 'fundProfile'],
		})

		const yieldRaw = summaryDetail?.yield ?? 0
		const estDividendYield = Number((yieldRaw * 100).toFixed(2))

		const returnRaw = fundPerformance?.trailingReturns.tenYear ?? 0
		const estTotalReturn = Number((returnRaw * 100).toFixed(2))

		const expenseRatioRaw = fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio ?? 0
		const expenseRatio = Number((expenseRatioRaw * 100).toFixed(2))

		return NextResponse.json(
			{
				estDividendYield,
				estTotalReturn,
				expenseRatio,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
				},
			}
		)
	} catch (err) {
		console.error(err)
		return NextResponse.json({
			estDividendYield: 0,
			estTotalReturn: 0,
			expenseRatio: 0,
		})
	}
}
