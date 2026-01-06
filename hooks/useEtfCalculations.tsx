import { useEtfCalcStore } from '@/components/etf-calculator/provider'
import {
	calculateFutureProjections,
	calculateHistoricalGrowth,
	DividendEvent,
	FutureProjectionInputs,
	FutureProjectionResult,
	HistoricalData,
	HistoricalGrowthInputs,
	HistoricalGrowthResult,
} from '@/utils/etf-calculator'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FieldErrors } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'

export function useEtfFutureCalculations(
	getValues: () => FutureProjectionInputs,
	errors: any,
	onCalculationComplete: (result: FutureProjectionResult | undefined) => void
) {
	const previousValues = useRef<Partial<FutureProjectionInputs>>({})

	const performCalculation = useCallback(
		(values: FutureProjectionInputs) => {
			if (Object.keys(errors).length > 0) return

			const result = calculateFutureProjections({
				...values,
			})

			return result
		},
		[errors]
	)

	// Debounced version for real-time feedback (optional)
	const debouncedCalculation = useDebouncedCallback(performCalculation, 300)

	// Smart dependency tracking
	const hasRelevantChanges = useCallback(
		(current: FutureProjectionInputs, previous: Partial<FutureProjectionInputs>) => {
			const relevantFields: (keyof FutureProjectionInputs)[] = [
				'initialInvestment',
				'monthlyContribution',
				'timeHorizon',
				'estTotalReturn',
				'estDividendYield',
				'frequency',
			]

			return relevantFields.some(field => current[field] !== previous[field])
		},
		[]
	)

	// Calculate on blur of any relevant field
	const calculate = useCallback(() => {
		const currentValues = getValues() as FutureProjectionInputs

		if (hasRelevantChanges(currentValues, previousValues.current)) {
			previousValues.current = currentValues
			const result = performCalculation(currentValues)
			onCalculationComplete(result)

			return result
		}
	}, [getValues, hasRelevantChanges, performCalculation])

	return {
		calculate,
		debouncedCalculation,
		performCalculation,
	}
}

/**
 * Normalizes a date to YYYY-MM-DD format (removes time component)
 * This ensures consistent date comparisons and cache keys
 */
function normalizeDateToString(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

async function fetchHistoricalData(ticker: string, startDate: Date, endDate: Date, signal?: AbortSignal) {
	const resp = await fetch('/api/etf/historical', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			ticker,
			startDate: normalizeDateToString(startDate),
			endDate: normalizeDateToString(endDate),
		}),
		signal,
	})

	if (!resp.ok) {
		throw new Error(`Failed to fetch historical data: ${resp.statusText}`)
	}

	return resp.json() as Promise<{
		prices: HistoricalData
		dividends: DividendEvent[]
	}>
}

// export function useEtfHistoricalGrowthCalculations(
// 	getValues: () => HistoricalGrowthInputs,
// 	errors: any,
// 	onCalculationComplete: (result: HistoricalGrowthResult | undefined) => void
// ) {
// 	const previousValues = useRef<Partial<HistoricalGrowthInputs>>({})
// 	const ticker = useEtfCalcStore(state => state.ticker)

// 	const performCalculation = useCallback(
// 		async (values: HistoricalGrowthInputs) => {
// 			if (Object.keys(errors).length > 0) return
// 			if (!ticker) return

// 			const resp = await fetch('/api/etf/historical', {
// 				method: 'POST',
// 				headers: { 'Content-Type': 'application/json' },
// 				body: JSON.stringify({
// 					ticker,
// 					startDate: values.startDate.toISOString(),
// 					endDate: new Date().toISOString(),
// 				}),
// 			})

// 			if (!resp.ok) throw new Error('Failed to fetch historical data')

// 			const { prices, dividends } = (await resp.json()) as {
// 				prices: HistoricalData
// 				dividends: DividendEvent[]
// 			}

// 			const result = await calculateHistoricalGrowth({
// 				...values,
// 				historicalData: prices,
// 				dividends,
// 			})

// 			return result
// 		},
// 		[ticker, errors]
// 	)

// 	// Debounced version for real-time feedback (optional)
// 	const debouncedCalculation = useDebouncedCallback(performCalculation, 300)

// 	const hasRelevantChanges = useCallback(
// 		(current: HistoricalGrowthInputs, previous: Partial<HistoricalGrowthInputs>) => {
// 			const relevantFields: (keyof HistoricalGrowthInputs)[] = [
// 				'initialInvestment',
// 				'startDate',
// 				'investmentAmount',
// 				'investmentFrequency',
// 				'reinvestDividends',
// 			]

// 			return relevantFields.some(field => current[field] !== previous[field])
// 		},
// 		[]
// 	)

// 	// Calculate on blur of any relevant field
// 	const calculate = useCallback(async () => {
// 		const currentValues = getValues() as HistoricalGrowthInputs

// 		if (hasRelevantChanges(currentValues, previousValues.current)) {
// 			previousValues.current = { ...currentValues }
// 			const result = await performCalculation(currentValues)
// 			onCalculationComplete(result)
// 			return result
// 		}
// 	}, [hasRelevantChanges, performCalculation])

// 	return {
// 		calculate,
// 		debouncedCalculation,
// 		performCalculation,
// 	}
// }

export function useEtfHistoricalGrowthCalculations(
	getValues: () => HistoricalGrowthInputs,
	errors: FieldErrors<HistoricalGrowthInputs>,
	onCalculationComplete: (result: HistoricalGrowthResult | undefined) => void
) {
	const previousValues = useRef<Partial<HistoricalGrowthInputs>>({})
	const ticker = useEtfCalcStore(state => state.ticker)
	const [queryEnabled, setQueryEnabled] = useState(false)
	const [calculationInputs, setCalculationInputs] = useState<HistoricalGrowthInputs | null>(null)

	// Generate cache key based on parameters
	const getCacheKey = useCallback(
		(values: HistoricalGrowthInputs) => {
			const today = new Date()

			return [
				'historical-data',
				ticker,
				normalizeDateToString(values.startDate),
				normalizeDateToString(today), // Cache by day for endDate
			]
		},
		[ticker]
	)

	// Use React Query for cached fetching
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: calculationInputs ? getCacheKey(calculationInputs) : ['historical-data'],
		queryFn: async ({ signal }) => {
			if (!calculationInputs || !ticker) return null

			return fetchHistoricalData(ticker, calculationInputs.startDate, new Date(), signal)
		},
		enabled: queryEnabled && !!ticker && !!calculationInputs,
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
	})

	const hasRelevantChanges = useCallback(
		(current: HistoricalGrowthInputs, previous: Partial<HistoricalGrowthInputs>) => {
			const relevantFields: (keyof HistoricalGrowthInputs)[] = [
				'initialInvestment',
				'startDate',
				'investmentAmount',
				'investmentFrequency',
				'reinvestDividends',
			]

			return relevantFields.some(field => {
				const currentValue = current[field]
				const previousValue = previous[field]

				if (currentValue instanceof Date && previousValue instanceof Date) {
					return currentValue.getTime() !== previousValue.getTime()
				}

				return currentValue !== previousValue
			})
		},
		[]
	)

	// Perform calculation when data is available
	const performCalculation = useCallback(
		async (values: HistoricalGrowthInputs, historicalData: { prices: HistoricalData; dividends: DividendEvent[] }) => {
			if (Object.keys(errors).length > 0) return

			const result = await calculateHistoricalGrowth({
				...values,
				historicalData: historicalData.prices,
				dividends: historicalData.dividends,
			})

			return result
		},
		[errors]
	)

	// Calculate function that triggers the query
	const calculate = useCallback(async () => {
		const currentValues = getValues()

		if (Object.keys(errors).length > 0) return
		if (!ticker) return

		// Check if we need to recalculate
		if (!hasRelevantChanges(currentValues, previousValues.current)) {
			return
		}

		previousValues.current = { ...currentValues }
		setCalculationInputs(currentValues)
		setQueryEnabled(true)
	}, [getValues, errors, ticker, hasRelevantChanges])

	// Watch for data changes and perform calculation
	const calculateWithData = useCallback(async () => {
		if (data && calculationInputs) {
			const result = await performCalculation(calculationInputs, data)
			onCalculationComplete(result)
			return result
		}
	}, [data, calculationInputs, performCalculation, onCalculationComplete])

	// Auto-calculate when data arrives
	useEffect(() => {
		if (data && calculationInputs) {
			calculateWithData()
		}
	}, [data, calculationInputs])

	return {
		calculate,
		isCalculating: isLoading,
		error: error as Error | null,
	}
}
