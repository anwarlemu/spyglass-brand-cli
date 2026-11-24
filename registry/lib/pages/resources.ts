// The resources pages' copy (the site's content/pages/resources.ts): the hub's cards and its rows of what is not ready,
// and the blog and articles lists with their empty state. The covers' creatives are Acme placeholders; pass your own
// images as `src`. Both flavors read this file.
import { siteChrome } from '@/lib/pages/site-chrome'
import type { ResourceCard, ResourceRow } from '@/lib/resource-cards'

/** An Acme placeholder creative for a cover. */
const tile = (brand: string, tone: 1 | 2 | 3 | 4) => ({ brand, tone })

export interface ResourceEntry {
	title: string
	line: string
	href: string
	/** ISO date, 2026-11-01. */
	date: string
}

export interface ResourceList {
	key: string
	title: string
	line: string
	entries: ResourceEntry[]
	/** What the page says while there are no entries. */
	empty: string
}

export const resourcesContent = {
	...siteChrome,
	head: { id: 'resources', lines: ['Resources'], lead: 'Templates, writing and docs for building on Acme.' },
	cards: [
		{
			title: 'Templates',
			line: 'Ready-made playbooks that run inside Claude or ChatGPT on Acme data.',
			href: '/templates',
			meta: '4 templates, coming soon',
			cover: { kind: 'creatives', items: [tile('Acme Skin', 2), tile('Acme Drinks', 3), tile('Acme Studio', 1), tile('Acme Fit', 4)] },
		},
		{
			title: 'Docs',
			line: 'Set up the MCP server, call the REST API and use the SDKs.',
			href: 'https://docs.acme.com',
			meta: 'docs.acme.com',
			cover: { kind: 'code', source: ['# The CLI', 'npm install -g @acme/cli', '# The MCP server', 'https://mcp.acme.com/mcp', '# The REST API', 'https://api.acme.com/v2'].join('\n') },
		},
		{
			title: 'Case studies',
			line: 'How agencies and marketing teams put Acme to work.',
			href: '/resources/case-studies',
			meta: '2 case studies',
			cover: { kind: 'creatives', items: [tile('Acme Skin', 3), tile('Acme Beauty', 2), tile('Acme Skin', 4)] },
		},
	] as ResourceCard[],
	rowsLabel: 'More resources',
	rows: [
		{ title: 'Blog', line: 'What the Acme team shipped, and what is next.', badge: 'Coming soon' },
		{ title: 'Articles', line: 'Guides to creative research with agents.', badge: 'Coming soon' },
		{ title: 'Demos', line: 'Acme at work in Claude, ChatGPT and Cursor.', badge: 'Coming soon' },
	] as ResourceRow[],
}

export type ResourcesContent = typeof resourcesContent

/** The blog with no posts yet, as the site shows it today. */
export const blogList: ResourceList = { key: 'blog', title: 'Blog', line: 'What the Acme team shipped, and what is next.', entries: [], empty: 'No posts yet. The first ones are on the way.' }

/** The articles list with entries, newest first once sorted. */
export const articlesList: ResourceList = {
	key: 'articles',
	title: 'Articles',
	line: 'Guides to creative research with agents.',
	empty: 'No articles yet. The first ones are on the way.',
	entries: [
		{ title: 'Reading a category from its longest-running ads', line: 'Why the ads a brand keeps paying for say more than the ones it launches.', href: '/resources/articles/longest-running-ads', date: '2026-11-12' },
		{ title: 'Briefing an agent on a competitor', line: 'The three questions that turn an ad library into a brief.', href: '/resources/articles/briefing-an-agent', date: '2026-10-28' },
		{ title: 'Hooks, angles and formats', line: 'A shared vocabulary for creative research, with examples from one category.', href: '/resources/articles/hooks-angles-formats', date: '2026-10-09' },
	],
}

export const resourceListContent = {
	...siteChrome,
	back: { label: 'All resources', href: '/resources' },
	list: blogList,
}

export type ResourceListContent = typeof resourceListContent

/** "Nov 12, 2026" from an ISO date, in UTC so every reader sees the same day. */
export function formatResourceDate(iso: string): string {
	return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
