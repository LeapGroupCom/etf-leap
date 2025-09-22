'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import * as React from 'react'

import { MenuItem } from '@/graphql/generated/graphql'
import { Link } from '@/i18n/navigation'
import { Separator } from '../ui/separator'

export function MobileNav({ items }: { items: MenuItem[] }) {
	const [open, setOpen] = React.useState(false)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					className="w-10 border px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
				>
					<Menu />
					<span className="sr-only">Toggle Menu</span>
				</Button>
			</SheetTrigger>

			<SheetContent side="left" className="pr-0 sm:rounded-tr-2xl sm:rounded-br-2xl backdrop-blur-xl bg-transparent" aria-describedby={undefined}>
				<SheetHeader>
					<SheetTitle className="text-left">ETFleap</SheetTitle>
				</SheetHeader>

				<ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
					<div className="flex flex-col space-y-3">
						<Separator />
						{items?.map(({ label, uri }) => (
							<Link
								key={uri}
								href={uri!}
								onClick={() => {
									setOpen(false)
								}}
							>
								{label}
							</Link>
						))}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}
