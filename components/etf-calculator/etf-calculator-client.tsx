'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { Skeleton } from '../ui/skeleton'
import { FutureProjection } from './future-projection'
import { HistoricalGrowth } from './historical-growth'

const paneVariants = ({
	isClient,
	activeTab,
}: {
	isClient: boolean
	activeTab: 'future-projection' | 'historical-growth'
}) => ({
	initial: !isClient
		? {
				x: 0,
				opacity: 1,
			}
		: {
				x: activeTab === 'future-projection' ? -10 : 10,
				opacity: 0,
			},
	enter: {
		x: 0,
		opacity: 1,
	},
	exit: {
		x: activeTab === 'future-projection' ? -10 : 10,
		opacity: 0,
	},
})

export function EtfCalculatorClient() {
	const t = useTranslations()
	const [isClient, setIsClient] = useState(false)
	const [mode, setMode] = useState<'future-projection' | 'historical-growth'>('future-projection')

	useEffect(() => {
		setIsClient(true)
	}, [])

	return (
		<>
			<Card className="border-none">
				<CardContent className="flex flex-col gap-6">
					<ToggleGroup
						type="single"
						defaultValue={mode}
						value={mode}
						onValueChange={value => {
							if (value) setMode(value as 'future-projection' | 'historical-growth')
						}}
						className="w-full"
					>
						<ToggleGroupItem value="future-projection" size="lg">
							{t('calculator_future_projection')}
						</ToggleGroupItem>
						<ToggleGroupItem value="historical-growth" size="lg">
							{t('calculator_historical_growth')}
						</ToggleGroupItem>
					</ToggleGroup>

					<AnimatePresence mode="wait">
						{match(mode)
							.with('future-projection', activeTab => (
								<motion.div
									key={mode}
									variants={paneVariants({ isClient, activeTab })}
									initial="initial"
									animate="enter"
									exit="exit"
									transition={{ duration: 0.2 }}
								>
									<FutureProjection />
								</motion.div>
							))
							.with('historical-growth', activeTab => (
								<motion.div
									key={mode}
									variants={paneVariants({ isClient, activeTab })}
									initial="initial"
									animate="enter"
									exit="exit"
									transition={{ duration: 0.2 }}
								>
									<HistoricalGrowth />
								</motion.div>
							))
							.exhaustive()}
					</AnimatePresence>
				</CardContent>
			</Card>
		</>
	)
}

export const EtfCalculatorClientSkeleton = () => (
	<Card className="h-[1664px] sm:h-[1692px] md:h-[1334px] lg:h-[1372px] overflow-hidden border-none bg-transparent p-0">
		<Skeleton className="bg-card h-full w-full" />
	</Card>
)
