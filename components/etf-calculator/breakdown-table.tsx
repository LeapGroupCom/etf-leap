import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useFormatter } from 'next-intl'
import { useEtfCalcStore } from './provider'

export const BreakdownTableFuture = ({ currency = 'USD' }: { currency?: string }) => {
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
			<div className="h-96 md:h-[590px] min-h-72 overflow-auto rounded-md border bg-background p-2">
				<Table className="w-full">
					<TableHeader>
						<TableRow>
							<TableHead className="text-center">Period</TableHead>
							<TableHead className="text-center">Contributions</TableHead>
							<TableHead className="text-center">Gains</TableHead>
							<TableHead className="text-center">Dividends</TableHead>
							<TableHead className="text-center">End Balance</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{futureData.length === 0 ? (
							<>
								{Array.from({ length: 10 }).map((_, index) => (
									<TableRow key={index} className="h-12">
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
									</TableRow>
								))}
							</>
						) : (
							<>
								{futureData.map(row => (
									<TableRow key={row.period} className="text-xs h-12">
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
			<div className="h-[450px] overflow-auto rounded-md border bg-background p-2">
				<Table className="w-full">
					<TableHeader>
						<TableRow>
							<TableHead className="text-center">Period</TableHead>
							<TableHead className="text-center">Start Balance</TableHead>
							<TableHead className="text-center">Contributions</TableHead>
							<TableHead className="text-center">Dividends</TableHead>
							<TableHead className="text-center">Period Gains</TableHead>
							<TableHead className="text-center">Return %</TableHead>
							<TableHead className="text-center">Shares</TableHead>
							<TableHead className="text-center">End Balance</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{historicalRows.length === 0 ? (
							<>
								{Array.from({ length: 12 }).map((_, index) => (
									<TableRow key={index} className="h-[33px]">
										<TableCell className="">
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 bg-card" />
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
