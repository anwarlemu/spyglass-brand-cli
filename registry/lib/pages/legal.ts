// The legal pages' copy (site app/terms and app/privacy): the page head's title and lead, the date the text changed,
// and the sections with neutral placeholder text to replace with what your counsel approves. Both flavors read this file.

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
		// The site shows the header's White button on pages whose head has no button of its own.
		cta: { label: 'Get a free API key', href: '/sign-up', short: 'Get API key' },
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

const placeholder = (what: string) => `This section covers ${what}. Replace this text with the terms your counsel approves.`

export const legalContent = {
	shell,
	id: 'terms',
	title: 'Terms of service',
	lead: 'The terms for using the service, in plain words. Questions about them go to the contact at the end.',
	/** The lead while the text is being prepared (`preparing`): the page shows only its head. */
	preparing: 'The updated terms of service are being prepared. They will be published on this page when they are ready.',
	updated: 'Last updated Nov 1, 2026',
	contents: 'On this page',
	sections: [
		{ id: 'who-we-are', title: 'Who we are', body: [placeholder('who provides the service and how to reach them')] },
		{ id: 'your-account', title: 'Your account', body: [placeholder('creating an account, keeping it secure and who may use it'), 'Each section can hold as many paragraphs as it needs.'] },
		{ id: 'using-the-service', title: 'Using the service', body: [placeholder('what the service may and may not be used for')] },
		{ id: 'plans-and-payment', title: 'Plans and payment', body: [placeholder('plans, billing, renewals and refunds')] },
		{ id: 'ending', title: 'Ending the agreement', body: [placeholder('how either side may end the agreement and what happens to data')] },
		{ id: 'contact', title: 'Contact', body: [placeholder('where to send questions about these terms')] },
	],
}

export type LegalContent = typeof legalContent

const privacy = (what: string) => `This section covers ${what}. Replace this text with the policy your counsel approves.`

/** The privacy policy's head and sections, in the same shape. */
export const legalPrivacyContent: LegalContent = {
	...legalContent,
	id: 'privacy',
	title: 'Privacy policy',
	lead: 'What we collect, why we keep it and the choices you have about it.',
	preparing: 'The updated privacy policy is being prepared. It will be published on this page when it is ready.',
	sections: [
		{ id: 'what-we-collect', title: 'What we collect', body: [privacy('the information you give us and what the service records as you use it')] },
		{ id: 'how-we-use-it', title: 'How we use it', body: [privacy('why the information is used and the grounds for using it')] },
		{ id: 'sharing', title: 'Who we share it with', body: [privacy('the providers that help run the service and when the law asks for information')] },
		{ id: 'keeping-it', title: 'How long we keep it', body: [privacy('how long each kind of information is kept and how it is deleted')] },
		{ id: 'your-choices', title: 'Your choices', body: [privacy('seeing, correcting, exporting and deleting your information')] },
		{ id: 'contact', title: 'Contact', body: [privacy('where to send questions about this policy')] },
	],
}
