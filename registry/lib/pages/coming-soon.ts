// The coming soon page's copy, from the site's content/pages/coming-soon.ts: the head, the sources coming next with the
// APIs each feeds, and the ones also on the list. The site names other companies' platforms and shows their marks;
// here the sources are named by kind and each `mark` is left to you (an image URL, tinted to the page's faint gray).
// Both flavors read this file.
export interface ComingApi { name: string, href: string }
export interface ComingSource { name: string, line: string, apis: ComingApi[], mark?: string }
export interface ComingAlso { name: string, mark?: string }

const api = (name: string, slug: string): ComingApi => ({ name, href: `/products/${slug}` })
const nav = [
	{ label: 'Products', href: '/products' },
	{ label: 'Use cases', href: '/use-cases' },
	{ label: 'Enterprise', href: '/enterprise' },
	{ label: 'Resources', href: '/resources' },
	{ label: 'Pricing', href: '/pricing' },
]

export const comingSoonContent = {
	header: { nav, secondary: { label: 'Sign in', href: '/sign-in' }, cta: { label: 'Get a free API key', href: '/sign-up' } },
	head: {
		lines: ['More of the social internet,', 'soon'],
		lead: 'Ads, posts and short videos are live today. Each source here comes to every plan as it lands, the free one too.',
		primary: { label: 'Get a free API key', href: '/sign-up' },
		secondary: { label: 'Tell us what to add next', href: '/contact' },
	},
	nextLabel: 'Next on Acme',
	feedsLabel: 'Comes to',
	next: <ComingSource[]>[
		{ name: 'Long-form video', line: 'The videos and shorts brands and creators post, and how they perform.', apis: [api('Brands API', 'brands'), api('Creators API', 'creators'), api('Media API', 'media')] },
		{ name: 'Search ads', line: 'The ads a brand runs on search, and the pages they lead to.', apis: [api('Brands API', 'brands'), api('Media API', 'media'), api('Landing Pages API', 'landing-pages')] },
		{ name: 'Work network ads', line: 'The ads a company runs to professionals, and where they send people.', apis: [api('Brands API', 'brands'), api('Media API', 'media'), api('Landing Pages API', 'landing-pages')] },
		{ name: 'Image boards', line: 'The pins and ads a brand puts out, found by what is in them.', apis: [api('Brands API', 'brands'), api('Media API', 'media')] },
		{ name: 'Microblogs', line: 'Creators on short posts, found by where they are and how many follow them.', apis: [api('Creators API', 'creators')] },
	],
	also: {
		title: 'Also on the list',
		note: 'Organic posts',
		sources: <ComingAlso[]>[{ name: 'Text threads' }, { name: 'Disappearing stories' }, { name: 'Open networks' }, { name: 'Forums' }],
	},
	close: { lines: ['Give your agents', 'the social internet'], note: '500 free credits every month. No card required.', primary: { label: 'Get a free API key', href: '/sign-up' } },
	footer: {
		legal: '© 2026 Acme Inc.',
		columns: [
			{ title: 'Products', wide: true, links: [{ label: 'Brands and creators', href: '/products/brands' }, { label: 'Media archive', href: '/products/media' }, { label: 'Collaborations', href: '/products/collabs' }, { label: 'Coming soon', href: '/products/coming-soon' }] },
			{ title: 'Use cases', wide: true, links: [{ label: 'Paid ads', href: '/use-cases/paid' }, { label: 'Organic social', href: '/use-cases/organic' }, { label: 'Creator sourcing', href: '/use-cases/creators' }] },
			{ title: 'Resources', links: [{ label: 'Templates', href: '/templates' }, { label: 'Docs', href: '/docs' }, { label: 'Blog', href: '/blog' }] },
			{ title: 'Company', links: [{ label: 'Enterprise', href: '/enterprise' }, { label: 'Talk to us', href: '/contact' }, { label: 'Sign in', href: '/sign-in' }] },
			{ title: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }] },
		],
	},
}

export type ComingSoonContent = typeof comingSoonContent
