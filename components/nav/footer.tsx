import { GetFooterDocument, LanguageCodeFilterEnum } from '@/graphql/generated/graphql'
import { Link } from '@/i18n/navigation'
import { fetchGraphQL } from '@/utils/fetchGraphQL'
import { getLocale, getTranslations } from 'next-intl/server'
import { Box, Container, Section } from '../craft'
import { LogoIcon } from '../logo'
import { Separator } from '../ui/separator'

export async function Footer() {
	const locale = await getLocale()
	const t = await getTranslations()
	const data = await fetchGraphQL(GetFooterDocument, {
		locale: locale.toUpperCase() as LanguageCodeFilterEnum,
	})
	const menuItems = data?.menuItems?.nodes

	return (
		<footer className="mt-auto border-t">
			<Section className="pb-4!">
				<Container className="grid gap-y-6 md:grid-cols-12">
					<div className="not-prose col-span-6 flex flex-col gap-6">
						<Link href="/">
							<h3 className="sr-only">ETFleap</h3>
							<LogoIcon className="h-[50px] w-auto" />
						</Link>
					</div>

					<Separator orientation="horizontal" className="col-span-12" />

					<Box cols={12} className="col-span-12 w-full gap-y-8 sm:gap-x-6">
						{menuItems?.map(item => {
							const childItems = item.childItems?.nodes ?? []

							return (
								<Box direction="col" gap={2} key={item.id} className="col-span-12 sm:col-span-6 lg:col-span-3">
									{item.uri === '#' ? (
										<h5 className="font-bold">{item.label}</h5>
									) : (
										<Link className="font-bold underline-offset-4 hover:underline" href={item.uri ?? ''}>
											{item.label}
										</Link>
									)}

									{childItems.length > 0 &&
										childItems.map(childItem => (
											<Link
												className="underline-offset-4 hover:underline"
												key={childItem.id}
												href={childItem.uri ?? ''}
											>
												{childItem.label}
											</Link>
										))}
								</Box>
							)
						})}
					</Box>

					<Separator orientation="horizontal" className="col-span-12" />
				</Container>
				<Container className="not-prose flex flex-col justify-between gap-6 pt-4 md:flex-row md:items-center md:gap-2">
					<p className="text-muted-foreground text-xs">{t('footer_copyright', { year: new Date().getFullYear() })}</p>
				</Container>
			</Section>
		</footer>
	)
}
