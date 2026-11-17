// The product page template's copy: the assets' own headlines and lines, with Acme placeholders for the creatives and the brief. Both flavors read this file.
/** An Acme placeholder creative: the advertiser, a neutral tone (1 to 4) and a headline. */
const creative = (brand: string, tone: 1 | 2 | 3 | 4, caption?: string) => (caption ? { brand, tone, caption } : { brand, tone })

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

export const productContent = {
	header: { ...header, nav: nav.map((l) => (l.href === '/product' ? { ...l, current: true } : l)) },
	hero: {
		headline: 'The world’s largest creative search engine.',
		body: 'Meta, TikTok, Instagram, and YouTube creatives in one index.',
		action: { label: 'Get Spyglass 50% off', href: '/pricing' },
		row: [creative('Acme Drinks', 3), creative('Acme Fit', 2, 'Ten minute plan.'), creative('Acme Studio', 4, 'Made to move.'), creative('Acme Skin', 1, 'Does it work?'), creative('Acme Drinks', 3)],
	},
	search: {
		headline: 'Search millions of brands and creators.',
		body: 'AI search across millions of creatives. Ask a question and get instant, structured results.',
		prompt: 'Show me UGC ads for skincare brands using before/after hooks',
		results: [creative('Acme Skin', 3, 'Glow in two steps.'), creative('Acme Skin', 2, 'The travel kit.'), creative('Acme Skin', 4, 'Night repair.')],
	},
	brief: {
		headline: 'Know what changed before your next meeting.',
		body: 'Spyglass follows the brands, creators, and niches that matter to you then turns the changes into a brief you actually want to read.',
		card: { title: 'Acme Skin, this week', lines: ['12 new ads, 8 of them UGC.', 'Before and after hooks up from 2 to 6.', 'Two creators added to the roster.'] },
	},
	category: {
		headline: 'Understand what is working in any category.',
		body: 'Compare brands, creators, campaigns, and formats to uncover what is gaining traction, what is falling behind, and why.',
		stats: [
			{ value: '128', label: 'Brands tracked' },
			{ value: '42', label: 'Boards shared' },
			{ value: '9', label: 'Alerts this week' },
			{ value: '12', label: 'Seats in use' },
		],
	},
	add: {
		headline: 'Add any brand or creator in under a minute.',
		grid: [creative('Acme Skin', 2), creative('Acme Studio', 1), creative('Acme Drinks', 3), creative('Acme Motors', 1), { light: true, seed: 0 }, creative('Acme Drinks', 4), creative('Acme Fit', 3), creative('Acme Studio', 2), creative('Acme Skin', 4)],
	},
	agents: {
		headline: 'Give your agents access to Instagram and TikTok.',
		ring: [creative('Acme Skin', 4), creative('Acme Studio', 2), creative('Acme Motors', 3), creative('Acme Fit', 1), creative('Acme Drinks', 3), creative('Acme Drinks', 4), creative('Acme Motors', 2), creative('Acme Fit', 3)],
	},
	offer: { headline: 'Stop screenshotting at midnight.', note: '$10 for your first month, then $20/month', cta: { label: 'Start Creator for 50% off', href: '/pricing' } },
	footer,
}

export type ProductContent = typeof productContent
