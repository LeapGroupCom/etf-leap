import { EtfFutureCalChart } from '@/components/charts/etf-calculator-chart'
import { Box } from '@/components/craft'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useEtfFutureCalculations } from '@/hooks/useEtfCalculations'
import {
	Frequency,
	FutureProjectionInputs,
	futureProjectionInputsSchema,
	FutureProjectionResult,
} from '@/utils/etf-calculator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormatter } from 'next-intl'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { BreakdownTableFuture } from './breakdown-table'
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

export function FutureProjection() {
	const [currency] = useState<keyof typeof CURRENCY_MAP>('usd')
	const [totals, setTotals] = useState<FutureProjectionResult['totals']>({
		balance: 0,
		contributions: 0,
		gains: 0,
		dividends: 0,
	})
	const formatter = useFormatter()

	const { setFutureProjectionsData, expenseRatio, ticker, estTotalReturn, estDividendYield } = useEtfCalcStore(
		state => state
	)

	const form = useForm<FutureProjectionInputs>({
		resolver: zodResolver(futureProjectionInputsSchema),
		defaultValues: {
			initialInvestment: 10000,
			monthlyContribution: 100,
			timeHorizon: 10,
			estTotalReturn,
			estDividendYield,
			frequency: 'yearly',
		},
		mode: 'onChange',
	})

	const { control, getValues, formState, setError } = form
	const { errors } = formState

	const { calculate } = useEtfFutureCalculations(getValues, errors, result => {
		if (result) {
			setFutureProjectionsData(result.projections)
			setTotals(result.totals)
		}
	})

	useEffect(() => {
		calculate()
	}, [])

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
				<div
					className="grid gap-x-0 gap-y-6 md:gap-x-6"
					style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr)) auto repeat(7, minmax(0, 1fr))' }}
				>
					<Box direction="col" gap={6} className="col-span-12 md:col-span-4">
						<FormField
							control={control}
							name="initialInvestment"
							render={({ field }) => (
								<FormItem>
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

						<Box direction="row" gap={2} className="w-full flex-wrap items-center justify-between">
							<FormField
								control={control}
								name="monthlyContribution"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Monthly Contribution</FormLabel>
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
								name="frequency"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Frequency</FormLabel>
										<FormControl>
											<ToggleGroup
												type="single"
												defaultValue={field.value}
												value={field.value}
												onValueChange={value => {
													if (!value) return

													field.onChange(value as Frequency)
												}}
												className="w-full"
											>
												<ToggleGroupItem value="yearly" size="sm">
													Yearly
												</ToggleGroupItem>
												<ToggleGroupItem value="monthly" size="sm">
													Monthly
												</ToggleGroupItem>
											</ToggleGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</Box>

						<FormField
							control={control}
							name="timeHorizon"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Time Horizon (Years)</FormLabel>
									<FormControl>
										<NumericFormat
											getInputRef={field.ref}
											value={field.value}
											customInput={Input}
											decimalScale={0}
											fixedDecimalScale={false}
											allowNegative={false}
											placeholder="10"
											inputMode="numeric"
											isAllowed={values => {
												const { floatValue } = values

												const isValid = floatValue === undefined || (!!floatValue && floatValue <= 50)
												if (!isValid) {
													setError('timeHorizon', { message: 'Time horizon must be between 1 and 50 years' })
												}

												return isValid
											}}
											onValueChange={values => {
												field.onChange(values.floatValue ?? '')
											}}
											onBlur={() => {
												field.onBlur()
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="estTotalReturn"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Est. Total Annual Return (%)</FormLabel>
									<FormControl>
										<NumericFormat
											getInputRef={field.ref}
											customInput={Input}
											thousandSeparator=", "
											decimalSeparator="."
											decimalScale={2}
											fixedDecimalScale={false}
											allowNegative={false}
											suffix=" %"
											value={field.value}
											onValueChange={values => {
												if (values.floatValue !== field.value) {
													field.onChange(values.floatValue ?? 0)
												}
											}}
											onBlur={field.onBlur}
											inputMode="numeric"
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="estDividendYield"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Est. Dividend Yield (%)</FormLabel>
									<FormControl>
										<NumericFormat
											getInputRef={field.ref}
											customInput={Input}
											thousandSeparator=", "
											decimalSeparator="."
											decimalScale={2}
											fixedDecimalScale={false}
											allowNegative={false}
											suffix=" %"
											value={field.value}
											onValueChange={values => {
												if (values.floatValue !== field.value) {
													field.onChange(values.floatValue ?? 0)
												}
											}}
											onBlur={field.onBlur}
											inputMode="numeric"
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<Box className="col-span-12 justify-center">
							<span className="text-sm text-muted-foreground">
								{ticker} Expense Ratio is <span className="font-bold">{expenseRatio}%</span>
							</span>
						</Box>

						<Button
							variant={formState.isDirty ? 'default' : 'outline'}
							size="default"
							className="w-full font-bold transition"
							onClick={calculate}
						>
							Calculate
						</Button>
					</Box>

					<Separator orientation="vertical" />

					<Box direction="col" gap={6} className="col-span-12 md:col-span-7">
						<Box direction="col" gap={4} className="h-full">
							<span className="text-lg font-bold">Breakdown</span>

							<BreakdownTableFuture currency={CURRENCY_MAP[currency].code} />
						</Box>
					</Box>

					<Box cols={12} gap={6} className="col-span-12 items-center md:mt-6">
						<Box direction="col" gap={4} className="order-2 col-span-12 w-full lg:order-1 lg:col-span-10">
							<EtfFutureCalChart className="grow" currency={CURRENCY_MAP[currency].code} />
						</Box>

						<Box
							direction="row"
							gap={4}
							className="order-1 col-span-12 my-4 w-full flex-row flex-wrap items-center justify-center lg:order-2 lg:col-span-2 lg:my-0 lg:w-auto lg:flex-col"
						>
							<Box direction="col" className="items-center gap-1">
								<span className="text-center text-sm text-muted-foreground">End Value</span>
								<span className="text-2xl font-bold">{format(totals.balance)}</span>
							</Box>

							<Box direction="col" className="items-center gap-1">
								<span className="text-center text-sm text-muted-foreground">Total Contributions</span>
								<span className="text-2xl font-bold text-(--chart-1)">{format(totals.contributions)}</span>
							</Box>

							<Box direction="col" className="items-center gap-1">
								<span className="text-center text-sm text-muted-foreground">Capital Gain</span>
								<span className="text-2xl font-bold text-(--chart-2)">{format(totals.gains)}</span>
							</Box>

							<Box direction="col" className="items-center gap-1">
								<span className="text-center text-sm text-muted-foreground">Dividends Earned</span>
								<span className="text-2xl font-bold text-(--chart-3)">{format(totals.dividends)}</span>
							</Box>
						</Box>
					</Box>
				</div>
			</FormProvider>
		</>
	)
}
