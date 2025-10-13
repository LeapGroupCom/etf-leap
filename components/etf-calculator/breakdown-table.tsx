import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useFormatter, useTranslations } from 'next-intl'
import { useEtfCalcStore } from './provider'

export const BreakdownTableFuture = ({ currency = 'USD' }: { currency?: string }) => {
	const t = useTranslations()
	const futureData = useEtfCalcStore(state => state.futureProjectionsData)

	const formatter = useFormatter()
	const format = (value: number) =>
		formatter.number(value, {
			style: 'currency',
			currency,
			notation: 'standard',
			compactDisplay: 'short',
			maximumFractionDigits: 2,
		})

	return (
		<>
			<div className="bg-background shadow-primary-foreground/30 h-96 min-h-72 overflow-auto rounded-md border p-2 shadow-sm md:h-[590px]">
				<Table className="w-full">
					<TableHeader>
						<TableRow>
							<TableHead className="text-center">{t('table_period')}</TableHead>
							<TableHead className="text-center">{t('table_contributions')}</TableHead>
							<TableHead className="text-center">{t('table_gains')}</TableHead>
							<TableHead className="text-center">{t('table_dividends')}</TableHead>
							<TableHead className="text-center">{t('table_end_balance')}</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{futureData.length === 0 ? (
							<>
								{Array.from({ length: 10 }).map((_, index) => (
									<TableRow key={index} className="h-12">
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
									</TableRow>
								))}
							</>
						) : (
							<>
								{futureData.map(row => (
									<TableRow key={row.period} className="h-12 text-xs">
										<TableCell className="text-center font-medium">{row.period}</TableCell>
										<TableCell className="text-center">{format(row.contributions)}</TableCell>
										<TableCell className="text-center">{format(row.gains)}</TableCell>
										<TableCell className="text-center">{format(row.dividends)}</TableCell>
										<TableCell className="text-center font-medium">{format(row.endingBalance)}</TableCell>
									</TableRow>
								))}
							</>
						)}
					</TableBody>
				</Table>
			</div>
		</>
	)
}

export const BreakdownTableHistorical = ({ currency = 'USD' }: { currency?: string }) => {
	const t = useTranslations()
	const historicalRows = useEtfCalcStore(state => state.historicalGrowthData)

	const formatter = useFormatter()
	const format = (value: number) =>
		formatter.number(value, {
			style: 'currency',
			currency,
			notation: 'standard',
			compactDisplay: 'short',
			maximumFractionDigits: 2,
		})

	return (
		<>
			{/* <div className="h-96 overflow-auto rounded-md border bg-background p-2"> */}
			<div className="bg-background shadow-primary-foreground/30 h-[450px] overflow-auto rounded-md border p-2 shadow-sm">
				<Table className="w-full">
					<TableHeader>
						<TableRow>
							<TableHead className="text-center">{t('table_period')}</TableHead>
							<TableHead className="text-center">{t('table_start_balance')}</TableHead>
							<TableHead className="text-center">{t('table_contributions')}</TableHead>
							<TableHead className="text-center">{t('table_dividends')}</TableHead>
							<TableHead className="text-center">{t('table_period_gains')}</TableHead>
							<TableHead className="text-center">{t('table_return_pct')}</TableHead>
							<TableHead className="text-center">{t('table_shares')}</TableHead>
							<TableHead className="text-center">{t('table_end_balance')}</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{historicalRows.length === 0 ? (
							<>
								{Array.from({ length: 12 }).map((_, index) => (
									<TableRow key={index} className="h-[33px]">
										<TableCell className="">
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
										<TableCell>
											<Skeleton className="bg-card h-4" />
										</TableCell>
									</TableRow>
								))}
							</>
						) : (
							<>
								{historicalRows.map(row => (
									<TableRow key={row.period} className="text-xs">
										<TableCell className="text-center font-medium">{row.period}</TableCell>
										<TableCell className="text-center">{format(row.startingBalance)}</TableCell>
										<TableCell className="text-center">{format(row.contributions)}</TableCell>
										<TableCell className="text-center">{format(row.dividends)}</TableCell>
										<TableCell className="text-center">{format(row.periodGains)}</TableCell>
										<TableCell className="text-center">{(row.returnPct * 100).toFixed(2)}</TableCell>
										<TableCell className="text-center">{row.shares.toFixed(4)}</TableCell>
										<TableCell className="text-center font-medium">{format(row.endingBalance)}</TableCell>
									</TableRow>
								))}
							</>
						)}
					</TableBody>
				</Table>
			</div>
		</>
	)
}
