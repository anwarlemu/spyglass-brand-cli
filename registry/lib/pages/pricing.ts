// The pricing page template's copy: the Creator plan exactly as the ad states it, and questions answered only with what the assets say. Both flavors read this file.
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

export const pricingContent = {
	header: { ...header, nav: nav.map((l) => (l.href === '/pricing' ? { ...l, current: true } : l)) },
	offer: { headline: 'Stop screenshotting at midnight.' },
	plans: [
		{
			title: 'Creator',
			price: '$10 for your first month, then $20/month',
			features: ['AI-powered research across brands, creators, ads, and campaigns', 'Unlimited board swipe files, alerts, and tracked brands', 'Unlimited team seats'],
			cta: 'Start Creator for 50% off',
			href: '/sign-up',
		},
	],
	faq: {
		title: 'Questions.',
		items: [
			{ q: 'What does the Creator plan cost?', a: '$10 for your first month, then $20/month.' },
			{ q: 'How many people can use it?', a: 'Unlimited team seats come with the plan.' },
			{ q: 'What can I research?', a: 'AI-powered research across brands, creators, ads, and campaigns.' },
			{ q: 'Which networks are in the index?', a: 'Meta, TikTok, Instagram, and YouTube creatives in one index.' },
			{ q: 'How long does it take to add a brand?', a: 'Add any brand or creator in under a minute.' },
		],
	},
	footer,
}

export type PricingContent = typeof pricingContent
