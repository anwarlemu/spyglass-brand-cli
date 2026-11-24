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
