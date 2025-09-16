import { Container, Section } from '@/components/craft'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
	const t = await getTranslations()

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
