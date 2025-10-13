'use client'

import { Container, Section } from '@/components/craft'
import { Button } from '@/components/ui/button'
import { NextIntlClientProvider } from 'next-intl'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import messages from '@/locales/en.json'

// This page renders when a route like `/unknown.txt` is requested.
// In this case, the layout at `app/[locale]/layout.tsx` receives
// an invalid value as the `[locale]` param and calls `notFound()`.

function NotFoundContent() {
	const t = useTranslations()
	
	return (
		<Section>
			<Container>
				<div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
					<h1 className="mb-4 text-4xl font-bold">{t('404_title')}</h1>
					<p className="mb-8">{t('404_subtitle')}</p>
					<Button asChild className="not-prose mt-6">
						<Link href="/">{t('404_button_text')}</Link>
					</Button>
				</div>
			</Container>
		</Section>
	)
}

export default function GlobalNotFound() {
	return (
		<html lang="en">
			<body>
				<NextIntlClientProvider locale="en" messages={messages}>
					<NotFoundContent />
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
