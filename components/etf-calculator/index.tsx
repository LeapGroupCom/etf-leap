import { yahooFinance } from '@/lib/yahoo-finance'
import { QueryClient } from '@tanstack/react-query'
import { EtfCalculatorClient } from './etf-calculator-client'
import { EtfCalcStoreProvider } from './provider'

async function getEstimates(ticker: string) {
	try {
		const { summaryDetail, fundPerformance, fundProfile } = await yahooFinance.quoteSummary(ticker, {
			modules: ['summaryDetail', 'fundPerformance', 'fundProfile'],
		})

		const yieldRaw = summaryDetail?.yield ?? 0
		const estDividendYield = Number((yieldRaw * 100).toFixed(2))

		const returnRaw = fundPerformance?.trailingReturns.tenYear ?? 0
		const estTotalReturn = Number((returnRaw * 100).toFixed(2))

		const expenseRatioRaw = fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio ?? 0
		const expenseRatio = Number((expenseRatioRaw * 100).toFixed(2))

		return {
			estDividendYield,
			estTotalReturn,
			expenseRatio,
		}
	} catch (error) {
		console.error(error)
		return {
			estDividendYield: 0,
			estTotalReturn: 0,
			expenseRatio: 0,
		}
	}
}

export const EtfCalculator = async ({ ticker }: { ticker: string }) => {
	const queryClient = new QueryClient()

	const { estTotalReturn, estDividendYield, expenseRatio } = await queryClient.fetchQuery({
		queryKey: ['estimates', ticker],
		queryFn: ({ queryKey }) => getEstimates(queryKey[1]),
	})

	return (
		<EtfCalcStoreProvider serverSideData={{ estTotalReturn, estDividendYield, ticker, expenseRatio }}>
			<EtfCalculatorClient />
		</EtfCalcStoreProvider>
	)
}
