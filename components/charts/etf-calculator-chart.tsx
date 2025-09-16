'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { useFormatter } from 'next-intl'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useEtfCalcStore } from '../etf-calculator/provider'

const chartConfig = {
	contributions: {
		label: 'Contributions',
		color: 'var(--chart-1)',
	},
	gains: {
		label: 'Gains',
		color: 'var(--chart-2)',
	},
	dividends: {
		label: 'Dividends',
		color: 'var(--chart-3)',
	},
} satisfies ChartConfig

export function EtfFutureCalChart({ className, currency }: { className?: string; currency: string }) {
	const projections = useEtfCalcStore(state => state.futureProjectionsData)

	const formatter = useFormatter()
	const format = (value: number) => {
		return formatter.number(value, {
			style: 'currency',
			currency,
			notation: 'compact',
			compactDisplay: 'short',
			maximumFractionDigits: 0,
		})
	}

	const chartData = projections.map(item => ({
		year: item.period,
		contributions: item.contributions,
		gains: item.gains,
		dividends: item.dividends,
		endBalance: item.endingBalance,
	}))

	return (
		<Card className={cn(className, 'pb-0')}>
			<CardContent className="p-0">
				<ChartContainer config={chartConfig} className="h-[250px] w-full sm:h-[350px] md:h-[400px] lg:h-[550px]">
					<BarChart accessibilityLayer data={chartData} className="h-full w-full">
						<CartesianGrid vertical={false} />
						<XAxis dataKey="year" tickLine={false} tickMargin={20} height={60} axisLine={false} tickCount={10} />
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={20}
							tickCount={7}
							tickFormatter={value => format(value)}
						/>
						<ChartTooltip content={<ChartTooltipContent withTotal />} />
						<ChartLegend verticalAlign="top" content={<ChartLegendContent className="flex-wrap" />} />
						<Bar dataKey="contributions" stackId="a" fill="var(--color-contributions)" radius={[0, 0, 0, 0]} />
						<Bar dataKey="gains" stackId="a" fill="var(--color-gains)" radius={[0, 0, 0, 0]} />
						<Bar dataKey="dividends" stackId="a" fill="var(--color-dividends)" radius={[0, 0, 0, 0]} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}

export function EtfHistoricalCalChart({ className, currency }: { className?: string; currency: string }) {
	const projections = useEtfCalcStore(state => state.historicalGrowthData)

	const formatter = useFormatter()
	const format = (value: number) => {
		return formatter.number(value, {
			style: 'currency',
			currency,
			notation: 'compact',
			compactDisplay: 'short',
			maximumFractionDigits: 0,
		})
	}

	const chartData = projections.map(item => ({
		period: item.period,
		contributions: item.contributions,
		gains: item.periodGains,
		dividends: item.dividends,
		endBalance: item.endingBalance,
	}))

	return (
		<Card className={cn(className, 'pb-0')}>
			<CardContent className="h-full w-full p-0">
				<ChartContainer config={chartConfig} className="h-full w-full">
					<BarChart accessibilityLayer data={chartData}>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="period" tickLine={false} tickMargin={10} height={60} axisLine={false} tickCount={10} />
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickCount={7}
							tickFormatter={value => format(value)}
						/>
						<ChartTooltip content={<ChartTooltipContent withTotal />} />
						<ChartLegend verticalAlign="top" content={<ChartLegendContent className="flex-wrap" />} />
						<Bar dataKey="contributions" stackId="a" fill="var(--color-contributions)" radius={[0, 0, 0, 0]} />
						<Bar dataKey="gains" stackId="a" fill="var(--color-gains)" radius={[0, 0, 0, 0]} />
						<Bar dataKey="dividends" stackId="a" fill="var(--color-dividends)" radius={[0, 0, 0, 0]} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
