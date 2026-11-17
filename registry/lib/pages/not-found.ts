// The 404 page template's copy: short declarative sentences, a search and the way home. Both flavors read this file.
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

export const notFoundContent = {
	header,
	eyebrow: '404',
	headline: 'This page is not here.',
	body: 'The link may be old or mistyped. Search for what you came for, or go home.',
	search: 'Search creatives, brands and creators',
	home: { label: 'Go home', href: '/' },
	footer,
}

export type NotFoundContent = typeof notFoundContent
