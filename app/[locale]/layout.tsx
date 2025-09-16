import { Footer } from '@/components/nav/footer'
import { Header } from '@/components/nav/header'
import QueryProvider from '@/components/providers/query-client-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { hasLocale, Locale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Montserrat as FontSans } from 'next/font/google'
import { notFound } from 'next/navigation'
import './globals.css'

const font = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
})

export function generateStaticParams() {
	return routing.locales.map(locale => ({ locale }))
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
	const { locale } = await params

	setRequestLocale(locale as Locale)

	if (!hasLocale(routing.locales, locale)) {
		notFound()
	}

	return (
		<html lang={locale} suppressHydrationWarning>
			<head />
			<body className={cn('flex min-h-screen flex-col font-sans antialiased', font.variable)}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<QueryProvider>
						<NextIntlClientProvider>
							<Header />
							{children}
							<Footer />
						</NextIntlClientProvider>
					</QueryProvider>
				</ThemeProvider>
				{/* <Analytics /> */}
			</body>
		</html>
	)
}
