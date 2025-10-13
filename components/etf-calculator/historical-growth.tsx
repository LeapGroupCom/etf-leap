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
import { useFormatter, useTranslations } from 'next-intl'
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
	const t = useTranslations()
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
								<FormLabel>{t('calculator_initial_investment')}</FormLabel>
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
								<FormLabel>{t('calculator_investment_amount')}</FormLabel>
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
								<FormLabel>{t('calculator_contribution_frequency')}</FormLabel>
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
											<ToggleGroupItem value="yearly">{t('calculator_yearly')}</ToggleGroupItem>
											<ToggleGroupItem value="monthly">{t('calculator_monthly')}</ToggleGroupItem>
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
								<FormLabel>{t('calculator_dividend_policy')}</FormLabel>
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
											<ToggleGroupItem value="reinvest">{t('calculator_reinvest')}</ToggleGroupItem>
											<ToggleGroupItem value="no-reinvest">{t('calculator_no_reinvest')}</ToggleGroupItem>
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
						{t('calculator_calculate')}
					</Button>

					<Separator orientation="horizontal" className="col-span-12" />

					<Box className="col-span-12 block">
						<Box direction="col" gap={4} className="grow">
							<span className="inline-block text-lg font-bold">{t('calculator_growth_breakdown')}</span>

							<BreakdownTableHistorical currency={CURRENCY_MAP[currency].code} />
						</Box>
					</Box>

					<Box cols={12} gap={6} className="col-span-12 items-center md:mt-6">
						<Box direction="col" gap={4} className="order-2 col-span-12 w-full lg:order-1 lg:col-span-10">
							<EtfHistoricalCalChart className="grow sm:min-h-[250px]" currency={CURRENCY_MAP[currency].code} />
						</Box>

						<Box
							direction="row"
							gap={4}
							className="order-1 col-span-12 my-4 w-full flex-row flex-wrap items-center justify-center lg:order-2 lg:col-span-2 lg:my-0 lg:w-auto lg:flex-col"
						>
							<Box direction="col" className="items-center gap-1">
								<span className="text-muted-foreground text-center text-sm">{t('calculator_end_value')}</span>
								<span className="text-2xl font-bold">{format(totals.balance)}</span>
							</Box>

							<Box direction="col" className="items-center gap-1">
								<span className="text-muted-foreground text-center text-sm">{t('calculator_total_contributions')}</span>
								<span className="text-2xl font-bold text-(--chart-1)">{format(totals.contributions)}</span>
							</Box>

							<Box direction="col" className="items-center gap-1">
								<span className="text-muted-foreground text-center text-sm">{t('calculator_capital_gain')}</span>
								<span className="text-2xl font-bold text-(--chart-2)">{format(totals.gains)}</span>
							</Box>

							<Box direction="col" className="items-center gap-1">
								<span className="text-muted-foreground text-center text-sm">{t('calculator_dividends_earned')}</span>
								<span className="text-2xl font-bold text-(--chart-3)">{format(totals.dividends)}</span>
							</Box>
						</Box>
					</Box>
				</Box>
			</FormProvider>
		</>
	)
}
