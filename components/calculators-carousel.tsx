'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Link } from '@/i18n/navigation'
import AutoPlay from 'embla-carousel-autoplay'

export type EtfSliderItem = {
	symbol: string
	title: string
	uri: string
}

type Props = {
	etfs: EtfSliderItem[]
}

export function CalculatorsCarousel({ etfs }: Props) {
	return (
		<Carousel
			opts={{
				loop: true,
				align: 'start',
			}}
			plugins={[
				// AutoPlay({
				// 	delay: 3000,
				// 	stopOnMouseEnter: true,
				// 	stopOnInteraction: false,
				// }),
			]}
			className="pb-12"
		>
			<CarouselContent>
				{etfs.map((etf, index) => (
					<CarouselItem key={index} className="basis-full pl-6 xs:basis-[66%] sm:basis-1/2 lg:basis-1/3">
						<CalculatorItem etf={etf} />
					</CarouselItem>
				))}
			</CarouselContent>

			<CarouselPrevious style={{ top: 'unset' }} className="-bottom-4 left-1" />
			<CarouselNext style={{ top: 'unset' }} className="-bottom-4 left-14" />
		</Carousel>
	)
}

type CalculatorItemProps = {
	etf: EtfSliderItem
}

export const CalculatorItem = ({ etf }: CalculatorItemProps) => {
	return (
		<div className='p-0.5'>
			<Link
				href={etf.uri}
				className="block h-full rounded-2xl border bg-card/70 p-5 transition-all duration-300 hover:border-primary hover:bg-card md:p-8 shadow-sm shadow-primary-foreground/30"
			>
				<span className="text-xl font-bold md:text-3xl">{etf.symbol}</span>
				<p className="mt-2 truncate text-sm text-muted-foreground md:text-base">{etf.title}</p>
			</Link>
		</div>
	)
}
