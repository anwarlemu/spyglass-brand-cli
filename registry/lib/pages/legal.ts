// The legal page template's copy: the sections a terms page has, with neutral placeholder text to replace with the terms your counsel approves. Both flavors read this file.
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

const placeholder = (what: string) => `This section covers ${what}. Replace this text with the terms your counsel approves.`

export const legalContent = {
	header,
	title: 'Terms of service.',
	updated: 'Last updated Nov 1, 2026',
	sections: [
		{ id: 'who-we-are', title: 'Who we are', body: [placeholder('who provides the service and how to reach them')] },
		{ id: 'your-account', title: 'Your account', body: [placeholder('creating an account, keeping it secure and who may use it'), 'Each section can hold as many paragraphs as it needs.'] },
		{ id: 'using-the-service', title: 'Using the service', body: [placeholder('what the service may and may not be used for')] },
		{ id: 'plans-and-payment', title: 'Plans and payment', body: [placeholder('plans, billing, renewals and refunds')] },
		{ id: 'ending', title: 'Ending the agreement', body: [placeholder('how either side may end the agreement and what happens to data')] },
		{ id: 'contact', title: 'Contact', body: [placeholder('where to send questions about these terms')] },
	],
	contents: 'On this page',
	footer,
}

export type LegalContent = typeof legalContent
