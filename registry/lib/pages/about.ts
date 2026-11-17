// The about page template's copy: the deck's headline, the imagery principles from the guidelines and the assets' facts; the rest is neutral template copy. Both flavors read this file.
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

export const aboutContent = {
	header,
	hero: {
		eyebrow: 'About',
		headline: 'The largest historical record of creative data.',
		body: 'Spyglass keeps the ads, posts and videos brands and creators publish, and makes every one of them searchable in plain words.',
	},
	row: [creative('Acme Skin', 2), creative('Acme Drinks', 3), creative('Acme Studio', 1), creative('Acme Fit', 4), creative('Acme Drinks', 2), creative('Acme Motors', 3)],
	beliefs: {
		title: 'What we keep to.',
		items: [
			{ title: 'Real creative.', body: 'Ads, product shots and UGC, from the brands people track. Never a mock-up.' },
			{ title: 'Color as posted.', body: 'No grading, no filters, no neon. What you see is what ran.' },
			{ title: 'One index.', body: 'Meta, TikTok, Instagram, and YouTube creatives in one index.' },
		],
	},
	stats: {
		title: 'Every creative in one place.',
		items: [
			{ value: '4', label: 'Networks in one index: Meta, TikTok, Instagram and YouTube.' },
			{ value: '1 min', label: 'To add any brand or creator.' },
			{ value: 'Unlimited', label: 'Team seats on the Creator plan.' },
			{ value: '$10', label: 'For your first month, then $20/month.' },
		],
	},
	join: { title: 'Build the archive with us.', body: 'We are a small team. We read every note.', cta: { label: 'See open roles', href: '/careers' } },
	footer,
}

export type AboutContent = typeof aboutContent
