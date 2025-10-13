'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HistoricalGrowthInputs } from '@/utils/etf-calculator'
import { DateTimeFormatOptions, useFormatter, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Box } from '../craft'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

export function MonthYearSelectPicker({
	minYear = 2004,
	maxYear = new Date().getFullYear(),
	className,
}: {
	minYear?: number
	maxYear?: number
	className?: string
}) {
	const t = useTranslations()
	const { control } = useFormContext<HistoricalGrowthInputs>()

	const formatter = useFormatter()

	const format = (date: Date, options?: DateTimeFormatOptions) => {
		return formatter.dateTime(date, options)
	}

	const yearOptions = useMemo(() => {
		return Array.from({ length: maxYear - minYear + 1 }).map((_, i) => {
			const y = minYear + i
			return (
				<SelectItem key={y} value={String(y)}>
					{y}
				</SelectItem>
			)
		})
	}, [minYear, maxYear])

	return (
		<>
			<FormField
				control={control}
				name="startDate"
				render={({ field }) => (
					<FormItem className={className}>
						<FormLabel>{t('start_date')}</FormLabel>
						<FormControl>
							<Box direction="row" gap={2}>
								{/* Year Selector */}
								<Select
									value={new Date(field.value).getFullYear().toString()}
									onValueChange={v => {
										field.onChange(new Date(parseInt(v), field.value.getMonth(), field.value.getDate()))
									}}
								>
									<SelectTrigger className="flex-1 shadow">
										<SelectValue placeholder={t('year_placeholder')} />
									</SelectTrigger>

									<SelectContent>{yearOptions}</SelectContent>
								</Select>

								{/* Month Selector */}
								<Select
									value={String(field.value.getMonth())}
									onValueChange={v =>
										field.onChange(new Date(field.value.getFullYear(), Number(v), field.value.getDate()))
									}
								>
									<SelectTrigger className="flex-1 shadow">
										<SelectValue placeholder={t('month_placeholder')} />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 12 }).map((_, m) => (
											<SelectItem key={m} value={String(m)}>
												{format(new Date(0, m), { month: 'long' })}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Box>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	)
}
