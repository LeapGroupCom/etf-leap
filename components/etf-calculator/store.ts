import { FutureProjectionResult, HistoricalGrowthResult } from '@/utils/etf-calculator'
import { create } from 'zustand'

export type EtfCalcState = {
	estTotalReturn: number
	estDividendYield: number
	ticker: string
	expenseRatio: number
	futureProjectionsData: FutureProjectionResult['projections']
	historicalGrowthData: HistoricalGrowthResult['projections']
}

export type EtfCalcActions = {
	setEstTotalReturn: (value: number) => void
	setEstDividendYield: (value: number) => void
	setTicker: (value: string) => void
	setExpenseRatio: (value: number) => void
	setFutureProjectionsData: (value: FutureProjectionResult['projections']) => void
	setHistoricalGrowthData: (value: HistoricalGrowthResult['projections']) => void
}

export type EtfCalcStore = EtfCalcState & EtfCalcActions

type ServerSideData = {
	estTotalReturn: number
	estDividendYield: number
	ticker: string
	expenseRatio: number
}

export const createEtfCalcStore = (d: ServerSideData) => {
	return create<EtfCalcStore>((set) => ({
		estTotalReturn: d.estTotalReturn,
		setEstTotalReturn: value => set({ estTotalReturn: value }),

		estDividendYield: d.estDividendYield,
		setEstDividendYield: value => set({ estDividendYield: value }),

		ticker: d.ticker,
		setTicker: value => set({ ticker: value }),

		expenseRatio: d.expenseRatio,
		setExpenseRatio: value => set({ expenseRatio: value }),

		futureProjectionsData: [],
		setFutureProjectionsData: value => set({ futureProjectionsData: value }),

		historicalGrowthData: [],
		setHistoricalGrowthData: value => set({ historicalGrowthData: value }),
	}))
}
