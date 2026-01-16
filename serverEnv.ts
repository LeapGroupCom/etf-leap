import 'server-only'
import { z } from 'zod'

export const serverEnv = z
	.object({
		// NEXT_PUBLIC_BASE_URL: z.string(),
		WORDPRESS_URL: z.string(),
		WORDPRESS_HOSTNAME: z.string(),
		NEXT_PUBLIC_SITE_URL: z.string(),
		WP_USER: z.string(),
		WP_APP_PASSWORD: z.string(),
		// ALPHA_VANTAGE_API_KEY: z.string(),
		// HEADLESS_SECRET: z.string(),
		// WP_USER: z.string(),
		// WP_APP_PASS: z.string(),
	})
	.parse(process.env)
