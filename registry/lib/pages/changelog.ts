// The changelog template's copy: example entries built from what the assets say the product does. The dates are placeholders: replace them with real releases. Both flavors read this file.
import type { CreativeImage } from '@/lib/image'
/** An Acme placeholder creative: the advertiser, a neutral tone (1 to 4) and a headline. */
const creative = (brand: string, tone: 1 | 2 | 3 | 4, caption?: string): CreativeImage => (caption ? { brand, tone, caption } : { brand, tone })

const nav = [
	{ label: 'Product', href: '/product' },
	{ label: 'Pricing', href: '/pricing' },
	{ label: 'Changelog', href: '/changelog' },
	{ label: 'Blog', href: '/blog' },
]
const footer = {
	domain: 'spyglass.so',
	links: [
		{ label: 'Product', href: '/product' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'About', href: '/about' },
		{ label: 'Changelog', href: '/changelog' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'Terms', href: '/legal' },
	],
}
const header = { nav, secondary: { label: 'Sign in', href: '/sign-in' }, cta: { label: 'Get 50% off', href: '/pricing' } }

export const changelogContent = {
	header: { ...header, nav: nav.map((l) => (l.href === '/changelog' ? { ...l, current: true } : l)) },
	title: 'Changelog.',
	body: 'New in Spyglass, newest first.',
	entries: [
		{ date: 'Nov 10, 2026', title: 'Give your agents access to Instagram and TikTok.', body: 'Agents can search creatives on Instagram and TikTok with the same questions you ask.', items: [] as string[], image: creative('Acme Studio', 3) },
		{ date: 'Oct 27, 2026', title: 'Add any brand or creator in under a minute.', body: 'Paste a handle or a page. Spyglass starts tracking it right away.', items: [] as string[], image: null as CreativeImage | null },
		{ date: 'Oct 13, 2026', title: 'Briefs on what changed.', body: 'Spyglass follows the brands, creators, and niches that matter to you then turns the changes into a brief you actually want to read.', items: ['New ads and formats, by brand.', 'Hooks that came back.', 'Creators added or dropped.'], image: null as CreativeImage | null },
		{ date: 'Sep 29, 2026', title: 'YouTube joins the index.', body: 'Meta, TikTok, Instagram, and YouTube creatives in one index.', items: [] as string[], image: creative('Acme Fit', 2) },
	],
	footer,
}

export type ChangelogContent = typeof changelogContent
