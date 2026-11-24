// The site's chrome copy for the inner pages (resources, case studies, use cases): the header's links and actions, the
// closing section and the footer's six columns, as the site lists them, with Acme's legal line. Both flavors read this file.
export const siteChrome = {
	header: {
		nav: [
			{ label: 'Products', href: '/products' },
			{ label: 'Use cases', href: '/use-cases' },
			{ label: 'Enterprise', href: '/enterprise' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Pricing', href: '/pricing' },
		],
		secondary: { label: 'Sign in', href: '/sign-in' },
		cta: { label: 'Get a free API key', href: '/sign-up' },
	},
	footer: {
		columns: [
			{ title: 'Products', wide: true, links: [{ label: 'Brands and creators', href: '/products/brand-search' }, { label: 'Media archive', href: '/products/media-search' }, { label: 'Collaborations', href: '/products/creator-collabs' }, { label: 'Creative insights', href: '/products/creative-insights' }, { label: 'Realtime search', href: '/products/realtime-search' }, { label: 'Coming soon', href: '/coming-soon' }] },
			{ title: 'Use cases', wide: true, links: [{ label: 'Build your own', href: '/use-cases/build' }, { label: 'Creative research', href: '/use-cases/creative-research' }, { label: 'Paid ads', href: '/use-cases/paid-ads' }, { label: 'Organic social', href: '/use-cases/organic-social' }, { label: 'Competitive analysis', href: '/use-cases/competitive-analysis' }, { label: 'Creator sourcing', href: '/use-cases/creator-sourcing' }] },
			{ title: 'Resources', links: [{ label: 'Templates', href: '/templates' }, { label: 'Docs', href: '/docs' }, { label: 'Blog', href: '/resources/blog' }, { label: 'Articles', href: '/resources/articles' }] },
			{ title: 'Company', links: [{ label: 'Enterprise', href: '/enterprise' }, { label: 'Talk to us', href: '/enterprise#contact' }, { label: 'Sign in', href: '/sign-in' }] },
			{ title: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }] },
			{ title: 'Community', links: [{ label: 'X', href: 'https://x.com' }, { label: 'LinkedIn', href: 'https://linkedin.com' }, { label: 'Instagram', href: 'https://instagram.com' }] },
		],
		legal: '© 2026 Acme Inc.',
	},
	close: {
		lines: ['Give your agents', 'the social internet'],
		note: '500 free credits every month. No card required.',
		primary: { label: 'Get a free API key', href: '/sign-up' },
	},
}

export type SiteChrome = typeof siteChrome
