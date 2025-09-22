'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { useLocale } from 'next-intl'

export function LocaleSwitcher() {
	const locale = useLocale()
	const pathname = usePathname()

	return (
		<Popover>
			<PopoverTrigger className="inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
				{locale.toUpperCase()}
			</PopoverTrigger>
			<PopoverContent align="end" className="top-6 flex flex-col gap-2">
				{routing.locales.map(lang => (
					<Link key={lang} href={pathname} locale={lang}>
						{lang.toUpperCase()}
					</Link>
				))}
			</PopoverContent>
		</Popover>
	)
}
