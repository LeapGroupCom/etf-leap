type DividendItem = {
	date: string
	amount: number
}

type HoldingItem = {
	companyName: string
	assetsPercent: number
	symbol: string
}

type GenerateEtfFaqItemsType = {
	ticker: string
	tenYearReturn: number
	dividends: DividendItem[]
	holdings: HoldingItem[]
}

/**
 * Generates FAQ items for an ETF based on its data
 * @param params - ETF data including ticker, returns, dividends, and holdings
 * @returns Array of FAQ items with questions and HTML-formatted answers
 */
export function generateEtfFaqItems({ ticker, tenYearReturn, dividends, holdings }: GenerateEtfFaqItemsType) {
	const dividendAnswer = generateDividendAnswer(ticker, dividends)
	const holdingsAnswer = generateHoldingsAnswer(ticker, holdings)

	return [
		{
			question: `What is the 10 year return for <strong>${ticker}</strong>?`,
			answer: `<strong>${ticker}</strong> has delivered roughly <strong>${formatPercentage(tenYearReturn)}</strong> annualized returns over the past 10 years.`,
		},
		{
			question: `Does <strong>${ticker}</strong> pay dividends?`,
			answer: dividendAnswer,
		},
		{
			question: `What holdings affect <strong>${ticker}</strong> the most?`,
			answer: holdingsAnswer,
		},
	]
}

function generateDividendAnswer(symbol: string, data: DividendItem[]) {
	if (!data || data.length === 0) {
		return `<strong>No.</strong> ${symbol} does not pay dividends.`
	}

	const usdFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	})

	// Sort dividends by date to get chronological order
	const sortedDividends = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

	const first = sortedDividends[0]
	const last = sortedDividends[sortedDividends.length - 1]

	if (!first || !last) {
		return `<strong>Yes.</strong> ${symbol} pays dividends.`
	}

	// Validate dates
	const firstDate = parseDate(first.date)
	const lastDate = parseDate(last.date)

	if (!firstDate || !lastDate) {
		return `<strong>Yes.</strong> ${symbol} pays dividends.`
	}

	const statusWord = last.amount > first.amount ? 'increased' : 'decreased'
	const firstAmount = usdFormatter.format(first.amount)
	const lastAmount = usdFormatter.format(last.amount)
	const firstYear = firstDate.getFullYear()
	const lastYear = lastDate.getFullYear()

	return `<strong>Yes.</strong> Over the past ${sortedDividends.length} years, <strong>${symbol}</strong> has paid roughly <strong>${firstAmount}</strong> per share in ${firstYear}, ${statusWord} to about <strong>${lastAmount}</strong> per share in ${lastYear}.`
}

function generateHoldingsAnswer(symbol: string, data: HoldingItem[]) {
	if (!data || data.length === 0) {
		return `No holdings data available for <strong>${symbol}</strong>.`
	}

	// Take top holdings (typically top 3-5)
	const topHoldings = data
		.slice(0, Math.min(5, data.length))
		.map(h => `<strong>${h.symbol}</strong> (<strong>${formatPercentage(h.assetsPercent)}</strong>)`)
		.join(', ')

	const totalPercent = data.slice(0, Math.min(5, data.length)).reduce((sum, h) => sum + h.assetsPercent, 0)
	const impactPhrase =
		totalPercent > 50
			? 'driving over half its performance'
			: `representing ${formatPercentage(totalPercent)} of the fund`

	return `The top holdings that affect <strong>${symbol}</strong> the most are ${topHoldings}, ${impactPhrase}.`
}

/**
 * Safely parse a date string
 * @param dateString - Date string to parse
 * @returns Date object or null if invalid
 */
function parseDate(dateString: string): Date | null {
	try {
		const date = new Date(dateString)
		return isNaN(date.getTime()) ? null : date
	} catch {
		return null
	}
}

/**
 * Format a number as a percentage
 * @param value - Number to format
 * @returns Formatted percentage string
 */
function formatPercentage(value: number): string {
	return `${value.toFixed(2)}%`
}
