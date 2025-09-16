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
import { useCallback, useRef } from 'react'
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

export function useEtfHistoricalGrowthCalculations(
	getValues: () => HistoricalGrowthInputs,
	errors: any,
	onCalculationComplete: (result: HistoricalGrowthResult | undefined) => void
) {
	const previousValues = useRef<Partial<HistoricalGrowthInputs>>({})
	const ticker = useEtfCalcStore(state => state.ticker)

	const performCalculation = useCallback(
		async (values: HistoricalGrowthInputs) => {
			if (Object.keys(errors).length > 0) return
			if (!ticker) return

			const resp = await fetch('/api/etf/historical', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ticker,
					startDate: values.startDate.toISOString(),
					endDate: new Date().toISOString(),
				}),
			})

			if (!resp.ok) throw new Error('Failed to fetch historical data')

			const { prices, dividends } = (await resp.json()) as {
				prices: HistoricalData
				dividends: DividendEvent[]
			}
			
			const result = await calculateHistoricalGrowth({
				...values,
				historicalData: prices,
				dividends,
			})

			return result
		},
		[ticker, errors]
	)

	// Debounced version for real-time feedback (optional)
	const debouncedCalculation = useDebouncedCallback(performCalculation, 300)

	const hasRelevantChanges = useCallback(
		(current: HistoricalGrowthInputs, previous: Partial<HistoricalGrowthInputs>) => {
			const relevantFields: (keyof HistoricalGrowthInputs)[] = [
				'initialInvestment',
				'startDate',
				'investmentAmount',
				'investmentFrequency',
				'reinvestDividends',
			]

			return relevantFields.some(field => current[field] !== previous[field])
		},
		[]
	)

	// Calculate on blur of any relevant field
	const calculate = useCallback(async () => {
		const currentValues = getValues() as HistoricalGrowthInputs

		if (hasRelevantChanges(currentValues, previousValues.current)) {
			previousValues.current = { ...currentValues }
			const result = await performCalculation(currentValues)
			onCalculationComplete(result)
			return result
		}
	}, [hasRelevantChanges, performCalculation])

	return {
		calculate,
		debouncedCalculation,
		performCalculation,
	}
}
