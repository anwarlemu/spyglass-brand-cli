// The contact page template's copy: short declarative sentences and a form with three fields. No address, phone
// number or reply time is stated: the brand assets give none. Both flavors read this file.
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

export const contactContent = {
	header,
	headline: 'Talk to us.',
	body: 'Questions about a plan, your team or the index. Send a note and a person reads it.',
	form: {
		label: 'Contact',
		action: '/contact',
		name: { label: 'Name', placeholder: 'Alex at Acme' },
		email: { label: 'Work email', placeholder: 'you@acme.com', description: 'Where we write back.' },
		message: { label: 'Message', placeholder: 'What would you like to know?' },
		submit: 'Send message',
	},
	footer,
}

export type ContactContent = typeof contactContent
