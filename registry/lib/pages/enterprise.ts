// The enterprise page's copy (the site's content/pages/enterprise.ts, for Acme). Both flavors read this file. The ring's
// creatives, the run's batch and the features' details have their own Acme placeholders in lib/enterprise-ring.ts,
// lib/automation-run.ts and lib/enterprise-features.ts.
export const enterpriseHeroContent = {
	/** The headline in two lines (the first kept on one line from 768). */
	title: ['Building creative engines', 'for the world’s most ambitious brands'] as [string, string],
	lead: 'Powered by the first agent-native creative search engine.',
	primary: { label: 'Book a demo', href: '/demo' },
	secondary: { label: 'See pricing', href: '/pricing' },
	/** The ring's accessible name. */
	label: 'Ads and posts from D2C brands, read by Acme',
}
export type EnterpriseHeroContent = typeof enterpriseHeroContent

export const enterpriseCloseContent = {
	title: ['Your creative army is', 'ready at your command'] as [string, string],
	note: 'Enterprise services require a 3-month minimum commitment, then continue monthly or quarterly.',
	primary: { label: 'Book a demo', href: '/demo' },
	secondary: { label: 'Get a free API key', href: '/sign-up' },
}
export type EnterpriseCloseContent = typeof enterpriseCloseContent

/** The site chrome around the enterprise page: the header's links (Enterprise current) and the footer's columns. */
export const enterprisePageContent = {
	header: {
		links: [
			{ label: 'Products', href: '/products' },
			{ label: 'Use cases', href: '/use-cases' },
			{ label: 'Enterprise', href: '/enterprise', current: true },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Pricing', href: '/pricing' },
		],
		secondary: { label: 'Sign in', href: '/sign-in' },
	},
	/** The logo row's name. */
	proof: 'Teams using Acme',
	hero: enterpriseHeroContent,
	close: enterpriseCloseContent,
	footer: {
		columns: [
			{ title: 'Products', wide: true, links: [{ label: 'Brands and creators', href: '/products/brands' }, { label: 'Media archive', href: '/products/archive' }, { label: 'Collaborations', href: '/products/collaborations' }, { label: 'Creative insights', href: '/products/insights' }, { label: 'Realtime search', href: '/products/search' }, { label: 'Coming soon', href: '/products/coming-soon' }] },
			{ title: 'Use cases', wide: true, links: [{ label: 'Build your own', href: '/use-cases/build' }, { label: 'Creative research', href: '/use-cases/research' }, { label: 'Paid ads', href: '/use-cases/paid' }, { label: 'Organic social', href: '/use-cases/organic' }, { label: 'Competitive analysis', href: '/use-cases/competitive' }, { label: 'Creator sourcing', href: '/use-cases/creators' }] },
			{ title: 'Resources', links: [{ label: 'Templates', href: '/templates' }, { label: 'Docs', href: '/docs' }, { label: 'Blog', href: '/blog' }, { label: 'Articles', href: '/articles' }] },
			{ title: 'Company', links: [{ label: 'Enterprise', href: '/enterprise' }, { label: 'Talk to us', href: '/demo' }, { label: 'Sign in', href: '/sign-in' }] },
			{ title: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }] },
			{ title: 'Community', links: [{ label: 'X', href: 'https://x.com' }, { label: 'LinkedIn', href: 'https://linkedin.com' }, { label: 'Instagram', href: 'https://instagram.com' }] },
		],
		legal: '© 2026 Acme Inc.',
	},
}
export type EnterprisePageContent = typeof enterprisePageContent

/** The enterprise page's sections in order; pass `sections` to reorder them or leave some out. */
export const enterpriseSections = ['hero', 'proof', 'run', 'features', 'close'] as const
export type EnterpriseSection = (typeof enterpriseSections)[number]
