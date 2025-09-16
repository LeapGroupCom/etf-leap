'use client'

import { Container, Section } from '@/components/craft'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// This page renders when a route like `/unknown.txt` is requested.
// In this case, the layout at `app/[locale]/layout.tsx` receives
// an invalid value as the `[locale]` param and calls `notFound()`.

export default function GlobalNotFound() {
	return (
		<html lang="en">
			<body>
				<Section>
					<Container>
						<div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
							<h1 className="mb-4 text-4xl font-bold">404 - Page Not Found!!!!!!</h1>
							<p className="mb-8">Sorry, the page you are looking for does not exist.</p>
							<Button asChild className="not-prose mt-6">
								<Link href="/en">Return Home</Link>
							</Button>
						</div>
					</Container>
				</Section>
			</body>
		</html>
	)
}
