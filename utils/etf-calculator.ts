import z from 'zod'

export type Frequency = 'yearly' | 'monthly'

export type Projection = {
	period: string
	startingBalance: number
	contributions: number
	dividends: number
	gains: number
	endingBalance: number
}

export type Totals = {
	balance: number
	contributions: number
	gains: number
	dividends: number
}

export const futureProjectionInputsSchema = z.object({
	initialInvestment: z.coerce.number<number>().min(0),
	monthlyContribution: z.coerce.number<number>().min(1, 'Contribution must be greater than 0'),
	timeHorizon: z.coerce
		.number<number>()
		.min(1, 'Time horizon must be between 1 and 50 years')
		.max(50, 'Time horizon must be between 1 and 50 years'),
	estTotalReturn: z.coerce.number<number>().min(0),
	estDividendYield: z.coerce.number<number>().min(0),
	frequency: z.enum(['yearly', 'monthly']),
})
export type FutureProjectionInputs = z.infer<typeof futureProjectionInputsSchema>

export type FutureProjectionResult = {
	projections: Projection[]
	totals: Totals
}

/**
 * Builds future-projection tables for gains, dividends, and balances.
 *
 * @param initialInvestment  Cash invested at period 0
 * @param monthlyContribution  Recurring monthly cash
 * @param timeHorizon  Time horizon in years
 * @param estTotalReturn  Estimated total annual return, e.g. 15.89
 * @param estDividendYield  Estimated annual dividend yield, e.g. 0.45
 * @param frequency  'yearly' or 'monthly' output
 */
export function calculateFutureProjections({
	initialInvestment,
	monthlyContribution,
	timeHorizon,
	estTotalReturn,
	estDividendYield,
	frequency = 'yearly',
	// }: FutureProjectionInputs): { projections: Projection[]; total: Total } {
}: FutureProjectionInputs): FutureProjectionResult {
	const projections: Projection[] = []
	const annualReturn = estTotalReturn / 100
	const dividendYield = estDividendYield / 100
	const totals: Totals = {
		balance: 0,
		contributions: 0,
		gains: 0,
		dividends: 0,
	}

	if (frequency === 'yearly') {
		const { projections: yearlyProjections, totals: yearlyTotal } = calculateFutureProjectionsYearly({
			initialInvestment,
			monthlyContribution,
			timeHorizon,
			annualReturn,
			dividendYield,
		})

		projections.push(...yearlyProjections)
		totals.balance = yearlyTotal.balance
		totals.contributions = yearlyTotal.contributions
		totals.gains = yearlyTotal.gains
		totals.dividends = yearlyTotal.dividends
	} else {
		const { projections: monthlyProjections, totals: monthlyTotal } = calculateFutureProjectionsMonthly({
			initialInvestment,
			monthlyContribution,
			timeHorizon,
			annualReturn,
			dividendYield,
		})

		projections.push(...monthlyProjections)
		totals.balance = monthlyTotal.balance
		totals.contributions = monthlyTotal.contributions
		totals.gains = monthlyTotal.gains
		totals.dividends = monthlyTotal.dividends
	}

	return { projections, totals }
}

function calculateFutureProjectionsYearly({
	initialInvestment,
	monthlyContribution,
	timeHorizon,
	annualReturn,
	dividendYield,
}: {
	initialInvestment: number
	monthlyContribution: number
	timeHorizon: number
	annualReturn: number
	dividendYield: number
}): { projections: Projection[]; totals: Totals } {
	const projections: Projection[] = []
	const totals: Totals = {
		balance: 0,
		contributions: 0,
		gains: 0,
		dividends: 0,
	}

	let balance = initialInvestment
	for (let year = 1; year <= timeHorizon; year++) {
		const contributions = monthlyContribution * 12
		const startingBalance = balance
		const gains = startingBalance * annualReturn
		const dividends = startingBalance * dividendYield
		// const dividends = 0

		balance = startingBalance + contributions + gains + dividends
		projections.push({
			period: `Year ${year}`,
			startingBalance,
			contributions,
			dividends,
			gains,
			endingBalance: balance,
		})

		totals.balance = balance
		totals.contributions += contributions
		totals.gains += gains
		totals.dividends += dividends
	}

	return { projections, totals }
}

function calculateFutureProjectionsMonthly({
	initialInvestment,
	monthlyContribution,
	timeHorizon,
	annualReturn,
	dividendYield,
}: {
	initialInvestment: number
	monthlyContribution: number
	timeHorizon: number
	annualReturn: number
	dividendYield: number
}): { projections: Projection[]; totals: Totals } {
	const projections: Projection[] = []
	const totals: Totals = {
		balance: 0,
		contributions: 0,
		gains: 0,
		dividends: 0,
	}

	let balance = initialInvestment

	const monthlyTotalReturn = Math.pow(1 + annualReturn, 1 / 12) - 1

	const monthlyDivYield = Math.pow(1 + dividendYield, 1 / 12) - 1

	const monthlyPriceReturn = monthlyTotalReturn - monthlyDivYield

	const monthFormatter = new Intl.DateTimeFormat('default', { month: 'short' })
	const monthNames = Array.from({ length: 12 }, (_, i) => monthFormatter.format(new Date(2020, i, 1)))

	for (let m = 1; m <= timeHorizon * 12; m++) {
		const startingBalance = balance
		const contributions = monthlyContribution
		const gains = startingBalance * monthlyPriceReturn
		const dividends = startingBalance * monthlyDivYield
		balance = startingBalance + contributions + gains + dividends

		const monthIndex = (m - 1) % 12
		const yearIndex = Math.floor((m - 1) / 12) + 1
		const period = `${monthNames[monthIndex]} Y${yearIndex}`

		projections.push({
			period,
			startingBalance,
			contributions,
			gains,
			dividends,
			endingBalance: balance,
		})

		totals.balance = balance
		totals.contributions += contributions
		totals.gains += gains
		totals.dividends += dividends
	}

	return { projections, totals }
}

// ======= ESTIMATES =======

export type Estimates = {
	estDividendYield: number
	estTotalReturn: number
	expenseRatio: number
}

// ======= HISTORICAL GROWTH =======

export const historicalGrowthInputsSchema = z.object({
	initialInvestment: z.coerce.number<number>().min(0),
	startDate: z.date(),
	investmentAmount: z.coerce.number<number>().min(0),
	investmentFrequency: z.enum(['monthly', 'yearly']),
	reinvestDividends: z.boolean(),
})
export type HistoricalGrowthInputs = z.infer<typeof historicalGrowthInputsSchema>

export type HistoricalData = {
	adjClose?: number | undefined
	date: string | Date
	open: number
	high: number
	low: number
	volume: number
	close: number
}[]

export type DividendEvent = {
	date: string | Date
	amount: number
}

export type HistoricalProjection = {
	period: string
	startingBalance: number
	contributions: number
	dividends: number
	periodGains: number
	returnPct: number
	endingBalance: number
	shares: number
}

export type HistoricalGrowthResult = {
	projections: HistoricalProjection[]
	totals: Totals
}

export async function calculateHistoricalGrowth({
	initialInvestment,
	startDate,
	reinvestDividends,
	historicalData,
	dividends,
	investmentAmount,
	investmentFrequency,
}: HistoricalGrowthInputs & {
	historicalData: HistoricalData
	dividends: DividendEvent[]
}): Promise<HistoricalGrowthResult> {


	// need to make sure we are using the correct data
	// make sure about price of the date and what period we're using to get price


	// ---- helpers ----
	const ymKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}` // month is zero-based
	const ymdKey = (d: Date) =>
		`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
	const monthLabel = (y: number, mZero: number) =>
		new Date(y, mZero, 1).toLocaleString('en-US', { month: 'short' }) + ' ' + y
	const lastDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0)

	// ---------- sanitize + sort ASC ----------
	const data = [...historicalData]
		.filter(d => d && d.date && (d.close || d.adjClose))
		.map(d => ({ ...d, date: new Date(d.date as any) }))
		.sort((a, b) => +a.date - +b.date)

	if (data.length === 0) {
		return {
			projections: [],
			totals: {
				balance: 0,
				contributions: 0,
				gains: 0,
				dividends: 0,
			},
		}
	}

	const seriesStart = data[0].date as Date
	const seriesEnd = data[data.length - 1].date as Date

	// Clamp: start at month-begin (max of requested vs series); end at min(current month vs series)
	const reqStart = new Date(startDate)
	const start = new Date(
		Math.max(reqStart.getTime(), new Date(seriesStart.getFullYear(), seriesStart.getMonth(), 1).getTime())
	)
	const now = new Date()
	const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
	const lastSeriesMonth = new Date(seriesEnd.getFullYear(), seriesEnd.getMonth(), 1)
	const end = new Date(Math.min(currentMonth.getTime(), lastSeriesMonth.getTime()))
	const endLastTradingCutoff = lastDayOfMonth(end)


	if (start > end || start > seriesEnd) {
		return {
			projections: [],
			totals: {
				balance: 0,
				contributions: 0,
				gains: 0,
				dividends: 0,
			},
		}
	}

	// ---------- dividend events map (per-share, by exact date) ----------
	const dividendsByYMD = new Map<string, number>()
	for (const ev of dividends || []) {
		const dt = new Date(ev.date)
		if (ev.amount > 0 && dt >= start && dt <= seriesEnd) {
			const key = ymdKey(dt)
			dividendsByYMD.set(key, (dividendsByYMD.get(key) || 0) + ev.amount)
		}
	}

	// ---------- price policy (avoid dividend double counting) ----------
	// If NO explicit dividends → use ADJ close (includes distributions); else use raw CLOSE.
	const useAdjusted = (dividends?.length ?? 0) === 0
	const priceOf = (bar: { close?: number; adjClose?: number }) =>
		useAdjusted ? (bar.adjClose ?? bar.close ?? 0) : (bar.close ?? bar.adjClose ?? 0)

	type Row = HistoricalProjection & {
		year: number // <-- numeric tags for robust aggregation
		monthZero: number // 0..11
	}

	// Generic simulator that returns MONTHLY rows for a cadence ('monthly' or 'yearly')
	function runSimulation(cadence: 'monthly' | 'yearly', contributionAmount: number) {
		let i = data.findIndex(d => (d.date as Date) >= start)
		if (i === -1) i = data.length - 1
		
		const startMonth = start.getMonth()
		const shouldContributeThisMonth = (d: Date) =>
			cadence === 'monthly' || (cadence === 'yearly' && d.getMonth() === startMonth)

		let shares = 0
		let cash = 0 // holds dividends when not reinvesting
		let totalInvested = 0 // user-contributed cash only (incl. initial)
		let totalDividendsCash = 0

		// Initial buy (first trading day on/after start)
		{
			const p0 = priceOf(data[i])
			if (initialInvestment > 0 && p0 > 0) {
				shares += initialInvestment / p0
				totalInvested += initialInvestment
			}
		}

		const rows: Row[] = []
		let currentMonthKey = ''
		let monthStartValue = 0
		let monthContrib = 0
		let monthDivs = 0
		let monthLastPrice = 0
		let monthYear = 0
		let monthZero = 0

		
		for (; i < data.length; i++) {
			const bar = data[i]
			// console.log('bar ', data[i]);
			const d = bar.date as Date
			if (d < start) continue
			if (d > endLastTradingCutoff) break

			const price = priceOf(bar)
			if (!(price > 0)) continue

			const keyYM = ymKey(d)
			const isNewMonth = keyYM !== currentMonthKey

			if (isNewMonth) {
				// Close previous month
				if (currentMonthKey !== '') {
					const endValue = shares * monthLastPrice + (reinvestDividends ? 0 : cash)
					const periodGains = endValue - monthStartValue - monthContrib
					const denom = monthStartValue + monthContrib
					const returnPct = denom > 0 ? periodGains / denom : 0

					rows.push({
						period: monthLabel(monthYear, monthZero),
						startingBalance: monthStartValue,
						contributions: monthContrib,
						dividends: monthDivs,
						periodGains,
						returnPct,
						endingBalance: endValue,
						shares, // shares at end of month
						year: monthYear,
						monthZero,
					})
				}

				// Start new month
				currentMonthKey = keyYM
				monthContrib = 0
				monthDivs = 0
				monthLastPrice = price
				monthYear = d.getFullYear()
				monthZero = d.getMonth()
				monthStartValue = shares * price + (reinvestDividends ? 0 : cash)

				// Contribution on first trading day of this month
				if (contributionAmount > 0 && shouldContributeThisMonth(d)) {
					shares += contributionAmount / price
					totalInvested += contributionAmount
					monthContrib += contributionAmount
				}
			} else {
				monthLastPrice = price
			}

			// Dividends (explicit events only; recognize on that exact date)
			const perShare = dividendsByYMD.get(ymdKey(d)) || 0
			if (perShare > 0 && shares > 0) {
				const cashDividend = shares * perShare
				totalDividendsCash += cashDividend
				monthDivs += cashDividend

				if (reinvestDividends) {
					shares += cashDividend / price // fractional shares on dividend day
				} else {
					cash += cashDividend // hold as cash in balance
				}
			}
		}

		// Close last month
		if (currentMonthKey !== '') {
			const endValue = shares * monthLastPrice + (reinvestDividends ? 0 : cash)
			const periodGains = endValue - monthStartValue - monthContrib
			const denom = monthStartValue + monthContrib
			const returnPct = denom > 0 ? periodGains / denom : 0

			rows.push({
				period: monthLabel(monthYear, monthZero),
				startingBalance: monthStartValue,
				contributions: monthContrib,
				dividends: monthDivs,
				periodGains,
				returnPct,
				endingBalance: endValue,
				shares,
				year: monthYear,
				monthZero,
			})
		}

		// Totals for this track
		const finalBalance = rows.at(-1)?.endingBalance ?? 0
		const totals: Totals = {
			balance: finalBalance,
			contributions: totalInvested,
			gains: finalBalance - totalInvested, // cumulative money-weighted P&L
			dividends: totalDividendsCash,
		}

		return { rows, totals }
	}

	// Run the monthly-contribution track
	const monthlyRun = runSimulation('monthly', investmentAmount)
	const monthlyRows = monthlyRun.rows
	const monthlyTotals = monthlyRun.totals

	if (investmentFrequency === 'monthly') {
		return {
			projections: monthlyRows,
			totals: monthlyTotals,
		}
	}

	// Run the yearly-contribution track (invests in startDate’s month each year)
	// NOTE: If your UI's "investmentAmount" is monthly-only and you want *annual* lump sums here,
	// pass (investmentAmount * 12) instead.
	const yearlyRun = runSimulation('yearly', investmentAmount)
	const yearlyMonthlyRows = yearlyRun.rows as Row[]

	// ---------- Aggregate the yearly plan to CALENDAR-YEAR rows (robust, no label parsing) ----------
	const byYear = new Map<number, Row[]>()
	for (const r of yearlyMonthlyRows) {
		if (!byYear.has(r.year)) byYear.set(r.year, [])
		byYear.get(r.year)!.push(r)
	}

	const years = [...byYear.keys()].sort((a, b) => a - b)
	const yearlyRows: HistoricalProjection[] = years.map(y => {
		const rows = byYear.get(y)!.sort((a, b) => a.year - b.year || a.monthZero - b.monthZero)
		const first = rows[0]
		const last = rows[rows.length - 1]

		const contributions = rows.reduce((s, r) => s + r.contributions, 0)
		const dividendsSum = rows.reduce((s, r) => s + r.dividends, 0)

		const periodGains = last.endingBalance - first.startingBalance - contributions
		const denom = first.startingBalance + contributions
		const returnPct = denom > 0 ? periodGains / denom : 0

		return {
			period: String(y),
			startingBalance: first.startingBalance,
			contributions,
			dividends: dividendsSum,
			periodGains,
			returnPct,
			endingBalance: last.endingBalance,
			shares: last.shares,
		}
	})

	// ---------- Totals for the yearly plan derived from aggregated rows ----------
	// Ensure totals always match the table (avoids drift vs. the monthly list inside yearlyRun)
	const yearlyFinalBalance = yearlyRows.at(-1)?.endingBalance ?? 0
	const yearlyContributionsExInitial = yearlyRows.reduce((s, r) => s + r.contributions, 0)
	const yearlyDividendsTotal = yearlyRows.reduce((s, r) => s + r.dividends, 0)
	const yearlyTotalInvested = initialInvestment + yearlyContributionsExInitial

	const yearlyTotals: Totals = {
		balance: yearlyFinalBalance,
		contributions: yearlyTotalInvested,
		gains: yearlyFinalBalance - yearlyTotalInvested,
		dividends: yearlyDividendsTotal,
	}

	return {
		projections: yearlyRows,
		totals: yearlyTotals,
	}
}










// export async function calculateHistoricalGrowth({
// 	initialInvestment,
// 	startDate,
// 	reinvestDividends,
// 	historicalData,
// 	dividends,
// 	investmentAmount,
// 	investmentFrequency,
// }: HistoricalGrowthInputs & {
// 	historicalData: HistoricalData
// 	dividends: DividendEvent[]
// }): Promise<HistoricalGrowthResult> {
// 	// ---- helpers ----
// 	const ymKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}` // month is zero-based
// 	const ymdKey = (d: Date) =>
// 		`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
// 	const monthLabel = (y: number, mZero: number) =>
// 		new Date(y, mZero, 1).toLocaleString('en-US', { month: 'short' }) + ' ' + y
// 	const lastDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0)

// 	// ---------- sanitize + sort ASC ----------
// 	const data = [...historicalData]
// 		.filter(d => d && d.date && (d.close || d.adjClose))
// 		.map(d => ({ ...d, date: new Date(d.date as any) }))
// 		.sort((a, b) => +a.date - +b.date)

// 	if (data.length === 0) {
// 		return {
// 			projections: [],
// 			totals: {
// 				balance: 0,
// 				contributions: 0,
// 				gains: 0,
// 				dividends: 0,
// 			},
// 		}
// 	}

// 	const seriesStart = data[0].date as Date
// 	const seriesEnd = data[data.length - 1].date as Date

// 	// Clamp: start at month-begin (max of requested vs series); end at min(current month vs series)
// 	const reqStart = new Date(startDate)
// 	const start = new Date(
// 		Math.max(reqStart.getTime(), new Date(seriesStart.getFullYear(), seriesStart.getMonth(), 1).getTime())
// 	)
// 	const now = new Date()
// 	const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
// 	const lastSeriesMonth = new Date(seriesEnd.getFullYear(), seriesEnd.getMonth(), 1)
// 	const end = new Date(Math.min(currentMonth.getTime(), lastSeriesMonth.getTime()))
// 	const endLastTradingCutoff = lastDayOfMonth(end)

// 	if (start > end || start > seriesEnd) {
// 		return {
// 			projections: [],
// 			totals: {
// 				balance: 0,
// 				contributions: 0,
// 				gains: 0,
// 				dividends: 0,
// 			},
// 		}
// 	}

// 	// ---------- dividend events map (per-share, by exact date) ----------
// 	const dividendsByYMD = new Map<string, number>()
// 	for (const ev of dividends || []) {
// 		const dt = new Date(ev.date)
// 		if (ev.amount > 0 && dt >= start && dt <= seriesEnd) {
// 			const key = ymdKey(dt)
// 			dividendsByYMD.set(key, (dividendsByYMD.get(key) || 0) + ev.amount)
// 		}
// 	}

// 	// ---------- price policy (avoid dividend double counting) ----------
// 	// If NO explicit dividends → use ADJ close (includes distributions); else use raw CLOSE.
// 	const useAdjusted = (dividends?.length ?? 0) === 0
// 	const priceOf = (bar: { close?: number; adjClose?: number }) =>
// 		useAdjusted ? (bar.adjClose ?? bar.close ?? 0) : (bar.close ?? bar.adjClose ?? 0)

// 	type Row = HistoricalProjection & {
// 		year: number // <-- numeric tags for robust aggregation
// 		monthZero: number // 0..11
// 	}

// 	// Generic simulator that returns MONTHLY rows for a cadence ('monthly' or 'yearly')
// 	function runSimulation(cadence: 'monthly' | 'yearly', contributionAmount: number) {
// 		let i = data.findIndex(d => (d.date as Date) >= start)
// 		if (i === -1) i = data.length - 1

// 		const startMonth = start.getMonth()
// 		const shouldContributeThisMonth = (d: Date) =>
// 			cadence === 'monthly' || (cadence === 'yearly' && d.getMonth() === startMonth)

// 		let shares = 0
// 		let cash = 0 // holds dividends when not reinvesting
// 		let totalInvested = 0 // user-contributed cash only (incl. initial)
// 		let totalDividendsCash = 0

// 		// Initial buy (first trading day on/after start)
// 		{
// 			const p0 = priceOf(data[i])
// 			if (initialInvestment > 0 && p0 > 0) {
// 				shares += initialInvestment / p0
// 				totalInvested += initialInvestment
// 			}
// 		}

// 		const rows: Row[] = []
// 		let currentMonthKey = ''
// 		let monthStartValue = 0
// 		let monthContrib = 0
// 		let monthDivs = 0
// 		let monthLastPrice = 0
// 		let monthYear = 0
// 		let monthZero = 0

// 		for (; i < data.length; i++) {
// 			const bar = data[i]
// 			const d = bar.date as Date
// 			if (d < start) continue
// 			if (d > endLastTradingCutoff) break

// 			const price = priceOf(bar)
// 			if (!(price > 0)) continue

// 			const keyYM = ymKey(d)
// 			const isNewMonth = keyYM !== currentMonthKey

// 			if (isNewMonth) {
// 				// Close previous month
// 				if (currentMonthKey !== '') {
// 					const endValue = shares * monthLastPrice + (reinvestDividends ? 0 : cash)
// 					const periodGains = endValue - monthStartValue - monthContrib
// 					const denom = monthStartValue + monthContrib
// 					const returnPct = denom > 0 ? periodGains / denom : 0

// 					rows.push({
// 						period: monthLabel(monthYear, monthZero),
// 						startingBalance: monthStartValue,
// 						contributions: monthContrib,
// 						dividends: monthDivs,
// 						periodGains,
// 						returnPct,
// 						endingBalance: endValue,
// 						shares, // shares at end of month
// 						year: monthYear,
// 						monthZero,
// 					})
// 				}

// 				// Start new month
// 				currentMonthKey = keyYM
// 				monthContrib = 0
// 				monthDivs = 0
// 				monthLastPrice = price
// 				monthYear = d.getFullYear()
// 				monthZero = d.getMonth()
// 				monthStartValue = shares * price + (reinvestDividends ? 0 : cash)

// 				// Contribution on first trading day of this month
// 				if (contributionAmount > 0 && shouldContributeThisMonth(d)) {
// 					shares += contributionAmount / price
// 					totalInvested += contributionAmount
// 					monthContrib += contributionAmount
// 				}
// 			} else {
// 				monthLastPrice = price
// 			}

// 			// Dividends (explicit events only; recognize on that exact date)
// 			const perShare = dividendsByYMD.get(ymdKey(d)) || 0
// 			if (perShare > 0 && shares > 0) {
// 				const cashDividend = shares * perShare
// 				totalDividendsCash += cashDividend
// 				monthDivs += cashDividend

// 				if (reinvestDividends) {
// 					shares += cashDividend / price // fractional shares on dividend day
// 				} else {
// 					cash += cashDividend // hold as cash in balance
// 				}
// 			}
// 		}

// 		// Close last month
// 		if (currentMonthKey !== '') {
// 			const endValue = shares * monthLastPrice + (reinvestDividends ? 0 : cash)
// 			const periodGains = endValue - monthStartValue - monthContrib
// 			const denom = monthStartValue + monthContrib
// 			const returnPct = denom > 0 ? periodGains / denom : 0

// 			rows.push({
// 				period: monthLabel(monthYear, monthZero),
// 				startingBalance: monthStartValue,
// 				contributions: monthContrib,
// 				dividends: monthDivs,
// 				periodGains,
// 				returnPct,
// 				endingBalance: endValue,
// 				shares,
// 				year: monthYear,
// 				monthZero,
// 			})
// 		}

// 		// Totals for this track
// 		const finalBalance = rows.at(-1)?.endingBalance ?? 0
// 		const totals: Totals = {
// 			balance: finalBalance,
// 			contributions: totalInvested,
// 			gains: finalBalance - totalInvested, // cumulative money-weighted P&L
// 			dividends: totalDividendsCash,
// 		}

// 		return { rows, totals }
// 	}

// 	// Run the monthly-contribution track
// 	const monthlyRun = runSimulation('monthly', investmentAmount)
// 	const monthlyRows = monthlyRun.rows
// 	const monthlyTotals = monthlyRun.totals

// 	if (investmentFrequency === 'monthly') {
// 		return {
// 			projections: monthlyRows,
// 			totals: monthlyTotals,
// 		}
// 	}

// 	// Run the yearly-contribution track (invests in startDate’s month each year)
// 	// NOTE: If your UI's "investmentAmount" is monthly-only and you want *annual* lump sums here,
// 	// pass (investmentAmount * 12) instead.
// 	const yearlyRun = runSimulation('yearly', investmentAmount)
// 	const yearlyMonthlyRows = yearlyRun.rows as Row[]

// 	// ---------- Aggregate the yearly plan to CALENDAR-YEAR rows (robust, no label parsing) ----------
// 	const byYear = new Map<number, Row[]>()
// 	for (const r of yearlyMonthlyRows) {
// 		if (!byYear.has(r.year)) byYear.set(r.year, [])
// 		byYear.get(r.year)!.push(r)
// 	}

// 	const years = [...byYear.keys()].sort((a, b) => a - b)
// 	const yearlyRows: HistoricalProjection[] = years.map(y => {
// 		const rows = byYear.get(y)!.sort((a, b) => a.year - b.year || a.monthZero - b.monthZero)
// 		const first = rows[0]
// 		const last = rows[rows.length - 1]

// 		const contributions = rows.reduce((s, r) => s + r.contributions, 0)
// 		const dividendsSum = rows.reduce((s, r) => s + r.dividends, 0)

// 		const periodGains = last.endingBalance - first.startingBalance - contributions
// 		const denom = first.startingBalance + contributions
// 		const returnPct = denom > 0 ? periodGains / denom : 0

// 		return {
// 			period: String(y),
// 			startingBalance: first.startingBalance,
// 			contributions,
// 			dividends: dividendsSum,
// 			periodGains,
// 			returnPct,
// 			endingBalance: last.endingBalance,
// 			shares: last.shares,
// 		}
// 	})

// 	// ---------- Totals for the yearly plan derived from aggregated rows ----------
// 	// Ensure totals always match the table (avoids drift vs. the monthly list inside yearlyRun)
// 	const yearlyFinalBalance = yearlyRows.at(-1)?.endingBalance ?? 0
// 	const yearlyContributionsExInitial = yearlyRows.reduce((s, r) => s + r.contributions, 0)
// 	const yearlyDividendsTotal = yearlyRows.reduce((s, r) => s + r.dividends, 0)
// 	const yearlyTotalInvested = initialInvestment + yearlyContributionsExInitial

// 	const yearlyTotals: Totals = {
// 		balance: yearlyFinalBalance,
// 		contributions: yearlyTotalInvested,
// 		gains: yearlyFinalBalance - yearlyTotalInvested,
// 		dividends: yearlyDividendsTotal,
// 	}

// 	return {
// 		projections: yearlyRows,
// 		totals: yearlyTotals,
// 	}
// }
