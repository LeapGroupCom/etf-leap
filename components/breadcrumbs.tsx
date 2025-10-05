import { Link } from '@/i18n/navigation'
import { SlashIcon } from 'lucide-react'
import { Fragment } from 'react'
import { Container } from './craft'
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from './ui/breadcrumb'

type Props = {
	items: {
		text: string
		url: string
	}[]
}

export async function Breadcrumbs({ items }: Props) {
	return (
		<div className="bg-background sticky top-[73px] z-50 border-b py-1">
			<Container>
				<BreadcrumbList>
					{items.map((item, index) => {
						const isLast = index + 1 === items.length

						return (
							<Fragment key={index}>
								{isLast ? (
									<BreadcrumbItem className="font-bold">{item.text}</BreadcrumbItem>
								) : (
									<>
										<BreadcrumbItem>
											<BreadcrumbLink asChild>
												<Link href={item.url}>{item.text}</Link>
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator>
											<SlashIcon />
										</BreadcrumbSeparator>
									</>
								)}
							</Fragment>
						)
					})}
				</BreadcrumbList>
			</Container>
		</div>
	)
}
