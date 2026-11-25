// The pricing page's copy, from the site's content/pages/pricing.ts: the head, the four plans (yearly prices at the
// site's 20% off), the compare table and the questions. Third-party names are left out (the data sources are named by
// kind). Both flavors read this file.
// The shape both flavors' pricing table takes (PricingTable.tsx, pricing-table.ts).
export interface PricingPlanCopy { name: string, description?: string, price: string, unit?: string, yearly?: { price: string, unit?: string }, tag?: string, badge?: string, featured?: boolean, rim?: boolean, cta?: string, href?: string, ladder?: string, features?: string[] }
export type CompareCellCopy = true | '' | string
export interface CompareGroupCopy { title: string, rows: { label: string, tip?: string, href?: string, soon?: boolean, cells: CompareCellCopy[] }[] }

const plans: { name: string, description?: string, price: string, unit?: string, yearly?: { price: string, unit?: string }, tag?: string, badge?: string, featured?: boolean, rim?: boolean, cta?: string, href?: string, ladder?: string, features?: string[] }[] = [
	{ name: 'Free', description: 'Try the API and MCP server.', price: '$0', unit: '/mo', cta: 'Get a free API key', href: '/sign-up', features: ['500 credits a month', 'No card needed', 'API and MCP access', 'Ads, posts and short videos', 'Python and Node SDKs'] },
	{ name: 'Creator', description: 'For individuals.', price: '$10', unit: '/mo', yearly: { price: '$8', unit: '/mo, billed yearly' }, cta: 'Start with Creator', href: '/sign-up', ladder: 'Everything in Free, plus:', features: ['5,000 credits ($2/1K)', '$2 per 1K additional credits'] },
	{ name: 'Pro', description: 'For teams and builders.', price: '$20', unit: '/mo', yearly: { price: '$16', unit: '/mo, billed yearly' }, tag: 'Save 25%', badge: 'Most popular', featured: true, cta: 'Start with Pro', href: '/sign-up', ladder: 'Everything in Creator, plus:', features: ['13,334 credits ($1.5/1K)', '$1.5 per 1K additional credits', 'Beta-access to new features'] },
	{ name: 'Enterprise', description: 'For brands and agencies.', price: 'Custom', rim: true, cta: 'Book a demo', href: '/contact', ladder: 'Everything in Pro, plus:', features: ['Volume pricing', 'Annual contract', '90-day pilot', 'Agents built with our team', 'Every brand and creator you track', 'Hands-on support'] },
]

const all: CompareCellCopy[] = [true, true, true, true]
const proUp: CompareCellCopy[] = ['', '', true, true]
const ent: CompareCellCopy[] = ['', '', '', true]

const nav = [
	{ label: 'Products', href: '/products' },
	{ label: 'Use cases', href: '/use-cases' },
	{ label: 'Enterprise', href: '/enterprise' },
	{ label: 'Resources', href: '/resources' },
	{ label: 'Pricing', href: '/pricing', current: true },
]

export const pricingContent = {
	header: { nav, secondary: { label: 'Sign in', href: '/sign-in' }, cta: { label: 'Get a free API key', href: '/sign-up' } },
	head: { lines: ['Start free.', 'Pay for what you use'], lead: '500 free credits every month. No card required.' },
	billing: { label: 'Billing', monthly: 'Monthly', yearly: 'Yearly' },
	note: { lead: 'Save 20%', rest: ' on a yearly subscription' },
	plans,
	compare: {
		id: 'compare',
		label: 'Compare plans',
		plans: plans.map((p) => ({ key: p.name.toLowerCase(), name: p.name })),
		defaultPlan: 'pro',
		groups: <{ title: string, rows: { label: string, tip?: string, href?: string, soon?: boolean, cells: (true | string)[] }[] }[]>[
			{
				title: 'Usage',
				rows: [
					{ label: 'Credits', tip: 'One credit is one record returned: one creative, one creator or one brand.', cells: ['500 a month', '5,000 a month', '13,000+ a month', 'Custom'] },
					{ label: 'After your credits', tip: "What happens once a month's credits are used.", cells: ['Stops', '$2 per 1K', '$1.50 per 1K', 'Volume pricing'] },
					{ label: 'Pay as you go', tip: 'No fixed plan: pay for the credits you use, from $20 a month.', cells: ['', '', true, ''] },
					{ label: 'Spend limits', tip: 'Cap what Pro can spend in a month.', soon: true, cells: ['', '', true, ''] },
				],
			},
			{
				title: 'APIs',
				rows: [
					{ label: 'Brands API', tip: 'Every brand, its ads and its pages.', href: '/products/brands', cells: [...all] },
					{ label: 'Creators API', tip: 'Creators, their posts and their audience.', href: '/products/creators', cells: [...all] },
					{ label: 'Media API', tip: 'Every creative, searchable by what is in it.', href: '/products/media', cells: [...all] },
					{ label: 'Tagged Posts API', tip: 'Posts that tag a brand or a creator.', href: '/products/tagged-posts', cells: [...all] },
					{ label: 'Comments API', tip: 'What people say under a post.', href: '/products/comments', cells: [...all] },
					{ label: 'Collabs API', tip: 'Who works with whom, post by post.', href: '/products/collabs', cells: [...all] },
					{ label: 'Landing Pages API', tip: 'The pages an ad sends people to.', href: '/products/landing-pages', cells: [...all] },
					{ label: 'Creative insights', tip: 'What is in a creative, read for you.', href: '/products/insights', cells: [...all] },
				],
			},
			{
				title: 'Data',
				rows: [
					{ label: 'Ad libraries', cells: [...all] },
					{ label: 'Photo and video posts', cells: [...all] },
					{ label: 'Short videos', cells: [...all] },
					{ label: 'More ad networks', soon: true, cells: [...all] },
					{ label: 'Add missing brands and creators', tip: 'Adding a brand or creator we have not indexed yet costs no credits.', cells: [...all] },
				],
			},
			{
				title: 'Access',
				rows: [
					{ label: 'REST API', tip: 'Call it from your own code.', href: '/docs/api', cells: [...all] },
					{ label: 'MCP server', tip: 'Ask from any MCP client. No API key needed.', href: '/docs/mcp', cells: [...all] },
					{ label: 'One credit pool', tip: 'The API and the MCP server draw on the same credits.', cells: [...all] },
					{ label: 'Python and Node SDKs', tip: 'Official SDKs for Python and Node.', href: '/docs/sdks', cells: [...all] },
					{ label: 'CLI', tip: 'Everything from your terminal.', href: '/docs/cli', cells: [...all] },
					{ label: 'Templates', tip: 'Ready-made playbooks that run in your assistant on this data.', href: '/templates', soon: true, cells: [...all] },
				],
			},
			{
				title: 'Additional benefits',
				rows: [
					{ label: 'Early access to new sources', tip: 'New platforms reach Pro and Enterprise first, as they launch.', cells: [...proUp] },
					{ label: 'Early access to new features', tip: 'Templates, monitors and what comes next, first on Pro and Enterprise.', cells: [...proUp] },
					{ label: 'Priority support', tip: 'Your questions go to the front of the line.', cells: [...proUp] },
				],
			},
			{
				title: 'Partnership',
				rows: [
					{ label: 'Done-for-you creative army', cells: ['', '', '', 'Optional add-on'] },
					{ label: '90-day commitment, then monthly or quarterly agreement', cells: [...ent] },
					{ label: 'Agents built with our team', cells: [...ent] },
					{ label: 'Always-on monitoring of your brands and creators', cells: [...ent] },
					{ label: 'Hands-on support', cells: [...ent] },
				],
			},
		],
	},
	faq: {
		id: 'pricing-faq',
		title: 'Questions about pricing',
		lead: 'Anything else, ask us.',
		action: { label: 'Talk to us', href: '/contact' },
		items: [
			{ q: 'What is a credit?', a: 'One record returned: one creative, one creator or one brand. Comments cost 5 credits a page. Errors are never billed.' },
			{ q: 'What happens when I run out?', a: 'Free stops until next month. On Creator, buy more at $2 per 1K. Pro continues at $1.50 per 1K.' },
			{ q: 'What is free?', a: 'Looking up product categories, adding a brand or creator that is not indexed yet and checking its status, comments on posts already cached, and your credit balance.' },
			{ q: 'What is the MCP server?', a: 'It lets you ask from any MCP client. You sign in with your browser, no API key needed.' },
			{ q: 'Do the API and the MCP server share credits?', a: 'Yes. Both draw on the same monthly credits. There is no separate API plan.' },
			{ q: 'How does the Enterprise pilot work?', a: 'Enterprise starts with a 90-day pilot, its scope agreed up front. Our team works with yours to define and build the agents and workflows.' },
			{ q: 'Do I need a card to start?', a: 'No. The free plan gives you 500 credits every month with no card required.' },
			{ q: 'Can I set a spend limit on Pro?', a: 'Spend limits on Pro are planned. Until then, you can check your remaining credits through the API at any time, free.' },
		],
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

export type PricingContent = typeof pricingContent
