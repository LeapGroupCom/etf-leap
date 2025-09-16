export function parseGlobMarketData(
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
