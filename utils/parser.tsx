import parse, { DOMNode, domToReact, Element, HTMLReactParserOptions } from 'html-react-parser'
import Link from 'next/link'

export function parseHtml(html: string) {
	const options: HTMLReactParserOptions = {
		replace: domNode => {
			if (domNode instanceof Element && domNode.attribs) {
				// Convert internal links to Next.js Link components.
				const { name, attribs, children } = domNode

				const isInternalLink = name === 'a' && attribs['data-internal-link'] === 'true'

				if (isInternalLink) {
					return (
						<Link href={attribs.href as any} {...attribs}>
							{domToReact(children as DOMNode[], options)}
						</Link>
					)
				}
			}
		},
	}

	return parse(html, options)
}

export function parseToPlainText(html: string) {
	let plainText = ''

	parse(html, {
		replace: domNode => {
			if (domNode.type === 'text' && 'data' in domNode) {
				plainText += domNode.data
			}
			return undefined
		},
	})

	return plainText
}
