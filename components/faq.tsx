import { clientEnv } from '@/clientEnv'
import { JsonLd } from 'react-schemaorg'
import { FAQPage } from 'schema-dts'
import { Prose } from './craft'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { parseToPlainText } from '@/utils/parser'

type Props = {
	items: {
		question: string
		answer: string
	}[]
}

export function Faq({ items }: Props) {
	return (
		<>
			<Separator className="mx-auto my-12 w-full" />

			<Prose>
				<div className="text-center">
					<Badge variant="default">FAQ</Badge>

					<h2 className="mt-4 text-4xl font-semibold">Things People Ask About This ETF</h2>
					<p className="text-muted-foreground mt-6 font-medium">
						Explore helpful insights and get quick answers to the most relevant questions about this investment.
					</p>
				</div>

				<div className="mx-auto mt-14 grid gap-8 md:grid-cols-2 md:gap-12">
					{items.map(({ question, answer }, index) => (
						<div className="flex gap-4" key={index}>
							<span className="bg-secondary text-primary flex size-6 shrink-0 items-center justify-center rounded-sm font-mono text-xs">
								{index + 1}
							</span>
							<div>
								<div className="mb-2 flex items-center justify-between">
									<h3 className="font-medium" dangerouslySetInnerHTML={{ __html: question }} />
								</div>
								<p className="text-muted-foreground text-sm" dangerouslySetInnerHTML={{ __html: answer }} />
							</div>
						</div>
					))}
				</div>
			</Prose>

			<JsonLd<FAQPage>
				item={{
					'@context': 'https://schema.org',
					'@type': 'FAQPage',
					publisher: {
						'@type': 'Organization',
						name: 'ETFLeap.com',
						url: clientEnv.NEXT_PUBLIC_SITE_URL,
					},
					mainEntity: items.map(({ question, answer }) => {
						return {
							'@type': 'Question',
							name: parseToPlainText(question as string),
							acceptedAnswer: {
								'@type': 'Answer',
								text: parseToPlainText(answer),
							},
						}
					}),
				}}
			/>
		</>
	)
}
