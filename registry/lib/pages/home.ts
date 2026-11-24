// The home page's copy (site app/v2/page.tsx: the header, the proof row, the questions and the footer; each section's
// own copy lives with its block in lib/home/). The questions are the site's own; the marks, customers and links are
// Acme placeholders. Both flavors read this file.
/** A mark in the proof row: a file drawn in the muted gray, or the name as a wordmark. */
export interface HomeProofLogo { name: string; src?: string; ratio?: number; height?: number }

const nav = [
	{ label: 'Products', href: '/products' },
	{ label: 'Use cases', href: '/use-cases' },
	{ label: 'Enterprise', href: '/enterprise' },
	{ label: 'Resources', href: '/resources' },
	{ label: 'Pricing', href: '/pricing' },
]

export const homeContent = {
	header: { nav, secondary: { label: 'Sign in', href: '/sign-in' }, cta: { label: 'Get a free API key', href: '/sign-up' } },
	proof: { title: 'Trusted by teams and agents at', logos: [{ name: 'Acme' }, { name: 'Acme Labs' }, { name: 'Acme Studio' }, { name: 'Acme Goods' }, { name: 'Acme Air' }, { name: 'Acme & Co' }] as HomeProofLogo[] },
	faq: {
		title: 'Frequently asked questions',
		lead: 'Anything else is in the docs, with every endpoint and tool.',
		action: { label: 'Read the docs', href: '/docs' },
		items: [
			{ q: 'How do credits work?', a: 'Most calls cost one credit per record returned: one brand, one creator or one creative. A search that returns 50 posts or ads uses 50 credits. The API and the MCP server draw on the same monthly credits, and a request that fails is never billed.' },
			{ q: 'What does Spyglass index?', a: 'Organic posts on Instagram and TikTok with their views, likes and comments, Meta ads across Facebook and Instagram placements, and the landing pages the ads link to. Brands and creators sit on one record across all of them. Google Ads, LinkedIn Ads and Pinterest are coming next.' },
			{ q: 'Can I see how organic posts perform?', a: 'Yes. Every Instagram and TikTok post comes with its views, likes and comments, and an outlier score against its own account’s usual. Rank a brand’s or a whole category’s posts by any of them, without its ads mixed in.' },
			{ q: 'How fresh is the data?', a: 'Spyglass watches public data continuously and keeps it, so ads that stopped running are still there. For an account that is not indexed yet, a live lookup fetches its latest posts in about 10 to 30 seconds and starts indexing the rest.' },
			{ q: 'Should I use the MCP server or the REST API?', a: 'Use the MCP server to ask in Claude, ChatGPT, Cursor or any MCP client. You sign in with your browser, no API key needed. Use the REST API to call Spyglass from your own code, with SDKs for Python and Node, and a CLI. Both reach the same data and credits.' },
			{ q: 'What if a brand I need is not indexed?', a: 'Add it. Send its website or Instagram handle, up to 20 at a time, and Spyglass indexes it automatically. Adding an account and checking its status are free.' },
			{ q: 'What is analyzed before I ask?', a: 'Every creative is tagged ahead of time for hook, angle, persona, format and funnel stage. Ask for a brand’s top hooks, personas, angles or media mix across the last 90 days and the answer is already computed.' },
			{ q: 'What happens when I run out of credits?', a: 'Free stops until next month. On Creator you can buy more at $2 per 1K credits, and Pro continues at $1.50 per 1K. Nothing is queued or partly charged in between.' },
		],
	},
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

export type HomeContent = typeof homeContent
