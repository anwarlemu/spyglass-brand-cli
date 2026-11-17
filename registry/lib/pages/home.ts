// The home page template's copy. Lines in quotes on the brand assets are used as they are (headlines, the ad copy,
// the Creator plan); the rest is neutral template copy and Acme placeholders to replace. Both flavors read this file.
/** An Acme placeholder creative: the advertiser, a neutral tone (1 to 4) and a headline. */
const creative = (brand: string, tone: 1 | 2 | 3 | 4, caption?: string) => (caption ? { brand, tone, caption } : { brand, tone })

export const homeContent = {
	nav: [
		{ label: 'Product', href: '/product' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'Changelog', href: '/changelog' },
		{ label: 'Blog', href: '/blog' },
	],
	secondary: { label: 'Sign in', href: '/sign-in' },
	cta: { label: 'Get 50% off', href: '/pricing' },
	hero: {
		headline: 'The only creative search engine.',
		body: 'AI search across millions of creatives. Ask a question and get instant, structured results.',
		action: { label: 'Get 50% off', href: '/pricing' },
		search: 'Show me UGC ads for skincare brands using before/after hooks',
	},
	results: [
		creative('Acme Skin', 3, 'Glow in two steps.'),
		creative('Acme Skin', 2, 'The travel kit.'),
		creative('Acme Skin', 4, 'Night repair.'),
	],
	index: {
		headline: 'The world’s largest creative search engine.',
		body: 'Meta, TikTok, Instagram, and YouTube creatives in one index.',
		corridor: [
			creative('Acme Studio', 3),
			creative('Acme Studio', 2),
			creative('Acme Fit', 4),
			creative('Acme Drinks', 3),
			creative('Acme Skin', 2),
			creative('Acme Fit', 1),
		],
	},
	features: [
		{ title: 'Know what changed before your next meeting.', body: 'Spyglass follows the brands, creators, and niches that matter to you then turns the changes into a brief you actually want to read.' },
		{ title: 'Understand what is working in any category.', body: 'Compare brands, creators, campaigns, and formats to uncover what is gaining traction, what is falling behind, and why.' },
		{ title: 'Search millions of creators in one place.', body: 'Spyglass monitors millions of brands and creators across Meta Ads, Instagram, and TikTok.' },
	],
	stats: {
		title: 'Every creative in one place.',
		items: [
			{ value: '4', label: 'Networks in one index: Meta, TikTok, Instagram and YouTube.' },
			{ value: '1 min', label: 'To add any brand or creator.' },
			{ value: 'Unlimited', label: 'Team seats on the Creator plan.' },
			{ value: '$10', label: 'For your first month, then $20/month.' },
		],
	},
	agents: {
		headline: 'Give your agents access to Instagram and TikTok.',
		ring: [
			creative('Acme Skin', 4),
			creative('Acme Studio', 2),
			creative('Acme Motors', 3),
			creative('Acme Fit', 1),
			creative('Acme Drinks', 3),
			creative('Acme Drinks', 4),
			creative('Acme Motors', 2),
			creative('Acme Fit', 3),
		],
	},
	testimonial: { quote: 'We see every launch in our category the day it goes live.', name: 'Alex Rivera', position: 'Head of growth, Acme' },
	offer: { headline: 'Stop screenshotting at midnight.', note: '$10 for your first month, then $20/month', cta: { label: 'Start Creator for 50% off', href: '/pricing' } },
	footer: {
		domain: 'spyglass.so',
		links: [
			{ label: 'Product', href: '/product' },
			{ label: 'Pricing', href: '/pricing' },
			{ label: 'About', href: '/about' },
			{ label: 'Changelog', href: '/changelog' },
			{ label: 'Blog', href: '/blog' },
			{ label: 'Terms', href: '/legal' },
		],
	},
}

export type HomeContent = typeof homeContent
