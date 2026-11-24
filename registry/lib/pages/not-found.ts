// The 404 page's copy (site content/pages/errors.ts): the title, what happened in a plain sentence and the two ways on.
// Both flavors read this file.

// The header's five pages and the sign-in, the footer's six columns and Acme's legal line.
const shell = {
	header: {
		nav: [
			{ label: 'Products', href: '/products' },
			{ label: 'Use cases', href: '/use-cases' },
			{ label: 'Enterprise', href: '/enterprise' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Pricing', href: '/pricing' },
		],
		secondary: { label: 'Sign in', href: '/sign-in' },
	},
	footer: {
		columns: [
			{ title: 'Products', wide: true, links: [{ label: 'Brands and creators', href: '/products/brand-search' }, { label: 'Media archive', href: '/products/media-search' }, { label: 'Collaborations', href: '/products/creator-collabs' }, { label: 'Creative insights', href: '/products/creative-insights' }, { label: 'Realtime search', href: '/products/realtime-search' }, { label: 'Coming soon', href: '/products' }] },
			{ title: 'Use cases', wide: true, links: [{ label: 'Build your own', href: '/use-cases/build' }, { label: 'Creative research', href: '/use-cases/creative-research' }, { label: 'Paid ads', href: '/use-cases/paid-ads' }, { label: 'Organic social', href: '/use-cases/organic-social' }, { label: 'Competitive analysis', href: '/use-cases/competitive-analysis' }, { label: 'Creator sourcing', href: '/use-cases/creator-sourcing' }] },
			{ title: 'Resources', links: [{ label: 'Templates', href: '/templates' }, { label: 'Docs', href: '/docs' }, { label: 'Blog', href: '/resources/blog' }, { label: 'Articles', href: '/resources/articles' }] },
			{ title: 'Company', links: [{ label: 'Enterprise', href: '/enterprise' }, { label: 'About', href: '/about' }, { label: 'Careers', href: '/about#careers' }, { label: 'Talk to us', href: '/enterprise#talk' }, { label: 'Sign in', href: '/sign-in' }] },
			{ title: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }] },
			{ title: 'Community', links: [{ label: 'X', href: 'https://x.com' }, { label: 'LinkedIn', href: 'https://linkedin.com' }, { label: 'Instagram', href: 'https://instagram.com' }] },
		],
		legal: '© 2026 Acme Inc.',
	},
}

// The careers template still reads these two (its header links and its footer row).
const header = {
	nav: [
		{ label: 'Product', href: '/product' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'Changelog', href: '/changelog' },
		{ label: 'Blog', href: '/blog' },
	],
	secondary: { label: 'Sign in', href: '/sign-in' },
	cta: { label: 'Get 50% off', href: '/pricing' },
}
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

export const notFoundContent = {
	shell,
	lines: ['Page not found'],
	lead: 'This page does not exist or has moved. Start from the homepage, or find what you need in the docs.',
	primary: { label: 'Go to the homepage', href: '/' },
	secondary: { label: 'Read the docs', href: '/docs' },
	header,
	footer,
}

export type NotFoundContent = typeof notFoundContent
