import { LanguageCodeEnum } from '@/graphql/generated/graphql'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting<Lowercase<LanguageCodeEnum>[]>({
	locales: ['en', 'fr'],
	defaultLocale: 'en',
})
