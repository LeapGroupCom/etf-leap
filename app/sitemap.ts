import { serverEnv } from '@/serverEnv'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// const posts = await getAllPosts()

	const staticUrls: MetadataRoute.Sitemap = [
		{
			url: `${serverEnv.NEXT_PUBLIC_SITE_URL}`,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 1,
		},
	]

	// const postUrls: MetadataRoute.Sitemap = posts.map(post => ({
	// 	url: `${serverEnv.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`,
	// 	lastModified: new Date(post.modified),
	// 	changeFrequency: 'weekly',
	// 	priority: 0.5,
	// }))

	// return [...staticUrls, ...postUrls]
	return [...staticUrls]
}
