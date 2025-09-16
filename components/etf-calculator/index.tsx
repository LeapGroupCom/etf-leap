import { yahooFinance } from '@/lib/yahoo-finance'
import { QueryClient } from '@tanstack/react-query'
import { EtfCalculatorClient } from './etf-calculator-client'
import { EtfCalcStoreProvider } from './provider'

async function getEstimates(ticker: string) {
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
}

export const EtfCalculator = async ({ ticker }: { ticker: string }) => {
	const queryClient = new QueryClient()

	const { estTotalReturn, estDividendYield, expenseRatio } = await queryClient.fetchQuery({
		queryKey: ['estimates', ticker],
		queryFn: ({ queryKey }) => getEstimates(queryKey[1]),
	})

	return (
		<EtfCalcStoreProvider
			serverSideData={{
				estTotalReturn: estTotalReturn ?? 0,
				estDividendYield: estDividendYield ?? 0,
				ticker,
				expenseRatio: expenseRatio ?? 0,
			}}
		>
			<EtfCalculatorClient />
		</EtfCalcStoreProvider>
	)
}
