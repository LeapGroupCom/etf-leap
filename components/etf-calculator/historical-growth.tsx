import { EtfHistoricalCalChart } from '@/components/charts/etf-calculator-chart'
import { Box } from '@/components/craft'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useEtfHistoricalGrowthCalculations } from '@/hooks/useEtfCalculations'
import { HistoricalGrowthInputs, historicalGrowthInputsSchema, HistoricalGrowthResult } from '@/utils/etf-calculator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormatter } from 'next-intl'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { BreakdownTableHistorical } from './breakdown-table'
import { MonthYearSelectPicker } from './month-year-select-picker'
import { useEtfCalcStore } from './provider'

const CURRENCY_MAP = {
	usd: {
		symbol: '$',
		code: 'USD',
	},
	eur: {
		symbol: '€',
		code: 'EUR',
	},
}

export function HistoricalGrowth() {
	const [currency] = useState<keyof typeof CURRENCY_MAP>('usd')
	const [totals, setTotals] = useState<HistoricalGrowthResult['totals']>({
		balance: 0,
		contributions: 0,
		gains: 0,
		dividends: 0,
	})
	const formatter = useFormatter()

	const { setHistoricalGrowthData } = useEtfCalcStore(state => state)

	const form = useForm<HistoricalGrowthInputs>({
		resolver: zodResolver(historicalGrowthInputsSchema),
		defaultValues: {
			initialInvestment: 10000,
			startDate: new Date('2020-01-01'),
			investmentAmount: 100,
			reinvestDividends: true,
			investmentFrequency: 'yearly',
		},
		mode: 'onChange',
	})

	const { control, getValues, formState } = form
	const { errors } = formState

	const { calculate } = useEtfHistoricalGrowthCalculations(getValues, errors, result => {
		if (result) {
			setTotals(result.totals)
			setHistoricalGrowthData(result.projections)
		}
	})

	useEffect(() => {
		calculate()
	}, [])

	// const frequency = useWatch({ control, name: 'investmentFrequency' })

	const format = (value: number) => {
		return formatter.number(value, {
			compactDisplay: 'short',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	}

	return (
		<>
			<FormProvider {...form}>
				<Box cols={12} className="gap-y-6 sm:gap-x-6">
					<FormField
						control={control}
						name="initialInvestment"
						render={({ field }) => (
							<FormItem className="col-span-12 sm:col-span-6 md:col-span-4">
								<FormLabel>Initial Investment</FormLabel>
								<FormControl>
									<NumericFormat
										getInputRef={field.ref}
										value={field.value}
										customInput={Input}
										thousandSeparator=", "
										decimalSeparator="."
										decimalScale={2}
										fixedDecimalScale={false}
										allowNegative={false}
										prefix={`${CURRENCY_MAP['usd'].symbol} `}
										onValueChange={values => {
											if (values.floatValue !== field.value) {
												field.onChange(values.floatValue ?? 0)
											}
										}}
										onBlur={field.onBlur}
										inputMode="numeric"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<MonthYearSelectPicker className="col-span-12 sm:col-span-6 md:col-span-4" />

					<FormField
						control={control}
						name="investmentAmount"
						render={({ field }) => (
							<FormItem className="col-span-12 w-full sm:col-span-6 md:col-span-4">
								<FormLabel>Investment Amount</FormLabel>
								<FormControl>
									<NumericFormat
										getInputRef={field.ref}
										value={field.value}
										customInput={Input}
										thousandSeparator=", "
										decimalSeparator="."
										decimalScale={2}
										fixedDecimalScale={false}
										allowNegative={false}
										prefix={`${CURRENCY_MAP['usd'].symbol} `}
										onValueChange={values => {
											if (values.floatValue !== field.value) {
												field.onChange(values.floatValue ?? 0)
											}
										}}
										onBlur={field.onBlur}
										inputMode="numeric"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="investmentFrequency"
						render={({ field }) => (
							<FormItem className="col-span-12 w-full sm:col-span-6 md:col-span-4">
								<FormLabel>Contribution Frequency</FormLabel>
								<FormControl>
									<Box direction="row" gap={2}>
										<ToggleGroup
											type="single"
											value={field.value}
											onValueChange={value => {
												if (!value) return
												field.onChange(value)
											}}
											className="h-10 w-full px-px"
											size="default"
										>
											<ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
											<ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
										</ToggleGroup>
									</Box>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="reinvestDividends"
						render={({ field }) => (
							<FormItem className="col-span-12 w-full sm:col-span-6 md:col-span-4">
								<FormLabel>Dividend Policy</FormLabel>
								<FormControl>
									<Box direction="row" gap={2}>
										<ToggleGroup
											type="single"
											value={field.value ? 'reinvest' : 'no-reinvest'}
											onValueChange={value => {
												if (!value) return
												field.onChange(value === 'reinvest')
											}}
											className="h-10 w-full px-px"
											size="default"
										>
											<ToggleGroupItem value="reinvest">Reinvest</ToggleGroupItem>
											<ToggleGroupItem value="no-reinvest">No Reinvest</ToggleGroupItem>
										</ToggleGroup>
									</Box>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						size="default"
						className="col-span-12 self-end font-bold sm:col-span-6 md:col-span-4"
						variant={'default'}
						onClick={() => calculate()}
					>
						Calculate
					</Button>

					<Separator orientation="horizontal" className="col-span-12" />

					<Box className="col-span-12 block">
						<Box direction="col" gap={4} className="grow">
							<span className="inline-block text-lg font-bold">Growth Breakdown</span>

							<BreakdownTableHistorical currency={CURRENCY_MAP[currency].code} />
						</Box>
					</Box>

					<Box direction={{ base: 'col', md: 'row' }} gap={6} className="col-span-12 items-center md:mt-6">
						<Box className="order-2 w-full grow md:order-1">
							<EtfHistoricalCalChart className="grow sm:min-h-[250px]" currency={CURRENCY_MAP[currency].code} />
						</Box>

						<Box
							direction={{
								base: 'row',
								md: 'col',
							}}
							wrap="wrap"
							gap={4}
							className="order-1 my-4 w-full items-center justify-center md:order-2 md:my-0 md:w-auto"
						>
							<Box direction="col" gap={1} className="items-center">
								<span className="text-center text-sm text-muted-foreground">End Value</span>
								<span className="text-2xl font-bold">{format(totals.balance)}</span>
							</Box>

							<Box direction="col" gap={1} className="items-center">
								<span className="text-center text-sm text-muted-foreground">Total Contributions</span>
								<span className="text-2xl font-bold text-(--chart-1)">{format(totals.contributions)}</span>
							</Box>

							<Box direction="col" gap={1} className="items-center">
								<span className="text-center text-sm text-muted-foreground">Capital Gain</span>
								<span className="text-2xl font-bold text-(--chart-2)">{format(totals.gains)}</span>
							</Box>

							<Box direction="col" gap={1} className="items-center">
								<span className="text-center text-sm text-muted-foreground">Dividends Earned</span>
								<span className="text-2xl font-bold text-(--chart-3)">{format(totals.dividends)}</span>
							</Box>
						</Box>
					</Box>
				</Box>
			</FormProvider>
		</>
	)
}
