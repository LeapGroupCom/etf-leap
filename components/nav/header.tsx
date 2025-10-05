import { LocaleSwitcher } from '@/components/locale-switcher'
import { MobileNav } from '@/components/nav/mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { GetHeaderDocument, LanguageCodeFilterEnum, MenuItem } from '@/graphql/generated/graphql'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import Logo from '@/public/logo.svg'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { getLocale } from 'next-intl/server'
import Image from 'next/image'

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
					<Image src={Logo} alt="Logo" loading="eager" className="dark:invert" width={42} height={26.44}></Image>

					<span className="text-sm">ETFleap</span>
				</Link>

				<div className="flex items-center gap-2 md:gap-4">
					<div className="mx-2 hidden md:flex">
						{menuItems?.map(({ label, uri }) => (
							<Button key={uri} asChild variant="ghost" size="sm">
								<Link key={uri} href={uri!}>
									{label}
								</Link>
							</Button>
						))}
					</div>

					<ThemeToggle />

					<LocaleSwitcher />

					{!!menuItems?.length && <MobileNav items={menuItems as MenuItem[]} />}
				</div>
			</div>
		</nav>
	)
}
