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
import { parseGlobMarketData } from '@/utils/glob-market'
import { useFormatter } from 'next-intl'
import { use } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { ChartResultArrayQuote } from 'yahoo-finance2/modules/chart'

type Props = {
	dataPromise: Promise<
		{
			ticker: any
			chart: ChartResultArrayQuote[]
		}[]
	>
	etfsDetails: { symbol: string; title: string }[]
}

export function ChartGlobMarket({ dataPromise, etfsDetails }: Props) {
	const formatter = useFormatter()
	const format = (value: number) => {
		return formatter.number(value, {
			notation: 'compact',
			compactDisplay: 'short',
			maximumFractionDigits: 1,
		})
	}

	const res = use(dataPromise)
	const data = parseGlobMarketData(res) ?? []

	if (data.length === 0) {
		return null
	}

	const config = Object.keys(data[0]).reduce((acc, k, index) => {
		if (k === 'date') return acc

		const etfDetail = etfsDetails.find(etf => etf.symbol.toLowerCase() === k.toLowerCase())

		acc[k] = {
			label: etfDetail?.symbol,
			color: `var(--chart-${index})`,
		}
		return acc
	}, {} as ChartConfig) satisfies ChartConfig

	return (
		<Card className="py-2 md:py-5">
			<CardContent className="px-2 md:px-5">
				<ChartContainer config={config} className="h-[200px] w-full sm:h-[350px] md:h-[500px] lg:h-[600px]">
					<LineChart
						accessibilityLayer
						data={data}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={true} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={10}
							tickFormatter={value => {
								const date = new Date(value)
								const year = date.getFullYear()
								const month = date.toLocaleString('en-US', { month: 'short' })
								return `${year} ${month}`
							}}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickCount={10}
							tickFormatter={value => format(value)}
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
						{Object.keys(config).map(key => (
							<Line
								key={key}
								dataKey={key}
								type="natural"
								fill={`var(--color-${key})`}
								fillOpacity={0.4}
								stroke={`var(--color-${key})`}
								dot={false}
							/>
						))}
						<ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
