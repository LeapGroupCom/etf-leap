import { MobileNav } from '@/components/nav/mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { GetHeaderDocument, LanguageCodeFilterEnum, MenuItem } from '@/graphql/generated/graphql'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { getLocale } from 'next-intl/server'
import { LogoIcon } from '../logo'

type Props = {
	className?: string
	id?: string
}

export async function Header({ className, id }: Props) {
	const locale = await getLocale()
	const data = await fetchGraphQL(GetHeaderDocument, {
		locale: locale.toUpperCase() as LanguageCodeFilterEnum,
	})
	const menuItems = data?.menuItems?.nodes

	return (
		<nav className={cn('bg-background sticky top-0 z-50', 'border-b', className)} id={id}>
			<div id="nav-container" className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
				<Link className="flex items-center gap-4 transition hover:opacity-75" href="/">
					<LogoIcon className="h-[40px] w-auto" />
				</Link>

				<div className="flex items-center gap-2 md:gap-6">
					<div className="mx-2 hidden gap-4 md:flex">
						{menuItems?.map(({ label, uri }) => (
							<Button key={uri} asChild variant="outline" size="sm">
								<Link key={uri} href={uri!}>
									{label}
								</Link>
							</Button>
						))}
					</div>

					<ThemeToggle />

					{/* hide locale switcher for now */}
					{/* <LocaleSwitcher /> */}

					{!!menuItems?.length && <MobileNav items={menuItems as MenuItem[]} />}
				</div>
			</div>
		</nav>
	)
}
