// The use-cases hub's copy (site app/use-cases, content/pages/use-cases.ts useCasesOverview): the head and the nine
// use cases in the menu's order, each a card with three Acme placeholder creatives as its cover. Both flavors read
// this file; the header and footer come from lib/pages/site-chrome.ts.
import type { ResourceCard } from '@/lib/resource-cards'
import { siteChrome, type SiteChrome } from '@/lib/pages/site-chrome'

const cover = (a: string, b: string, c: string, tone: 1 | 2 | 3 | 4 = 2): ResourceCard['cover'] => ({
	kind: 'creatives',
	items: [
		{ brand: a, tone },
		{ brand: b, tone: tone === 4 ? 3 : ((tone + 1) as 2 | 3 | 4) },
		{ brand: c, tone: tone === 1 ? 2 : ((tone - 1) as 1 | 2 | 3) },
	],
})

export const useCasesContent = {
	id: 'use-cases',
	head: {
		lines: ['Use cases'],
		lead: 'Nine ways teams put Spyglass to work, from a single question to a tool of their own.',
	},
	cards: [
		{ title: 'Build your own', line: 'Your own agents, ad libraries and tools, built on the API and MCP server.', meta: 'For developers, AI builders and growth teams.', href: '/use-cases/build-your-own', cover: cover('Acme', 'Acme', 'Acme', 2) },
		{ title: 'Creative research', line: 'The hooks, angles and formats that win for any brand, worked out before you ask.', meta: 'For creative strategists, designers and performance teams.', href: '/use-cases/creative-research', cover: cover('Acme', 'Acme', 'Acme', 3) },
		{ title: 'Paid media', line: 'What brands are running, how long, with which hooks, angles and landing pages.', meta: 'For performance marketers, creative strategists and agencies.', href: '/use-cases/paid-media', cover: cover('Acme', 'Acme', 'Acme', 1) },
		{ title: 'Organic social', line: 'What brands and creators post and how it performs.', meta: 'For social and brand teams.', href: '/use-cases/organic-social', cover: cover('Acme', 'Acme', 'Acme', 3) },
		{ title: 'Competitive analysis', line: 'What competitors launch, test and keep running, from the day it goes live.', meta: 'For brand, growth and strategy teams, and agencies.', href: '/use-cases/competitive-analysis', cover: cover('Acme', 'Acme', 'Acme', 2) },
		{ title: 'Creators', line: 'Finding and hiring creators at scale, and seeing who works with whom.', meta: 'For creator and partnerships teams, and agencies.', href: '/use-cases/creators', cover: cover('Acme', 'Acme', 'Acme', 4) },
		{ title: 'Consumer sentiment', line: 'What people say about brands and products in the comments, sorted into what to act on.', meta: 'For brand, social, product and insights teams.', href: '/use-cases/consumer-sentiment', cover: cover('Acme', 'Acme', 'Acme', 3) },
		{ title: 'Landing page development', line: 'Where a brand’s ads lead, and the pages it keeps sending them to.', meta: 'For growth, CRO and web teams.', href: '/use-cases/landing-page-development', cover: cover('Acme', 'Acme', 'Acme', 4) },
		{ title: '360-degree research', line: 'One brand, all of it: its ads, posts, creators, landing pages and comments on one record.', meta: 'For strategists, agencies and brand teams.', href: '/use-cases/360-degree-research', cover: cover('Acme', 'Acme', 'Acme', 2) },
	] satisfies ResourceCard[],
	chrome: siteChrome as SiteChrome,
}

export type UseCasesContent = typeof useCasesContent
