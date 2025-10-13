import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
	locales: ['en'],
	defaultLocale: 'en',

	localePrefix: 'as-needed',
	localeCookie: {
		name: 'NEXT_LOCALE',
		maxAge: 60 * 60 * 24 * 365, // one year
	},
})
