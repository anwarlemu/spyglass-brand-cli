// The templates wall's copy and the templates page's copy (site content/v2/templates.ts, content/home.ts templates,
// content/pages/templates.ts and templatesCities.ts), with Acme's material: the names are the templates' own kinds,
// never a platform's product. Both flavors read this file.

export interface TemplatesWallContent {
	/** The line over the rolling chip. */
	headline: string
	/** The names the chip rolls through, one per step. */
	names: string[]
	lead: string
	/** The quiet line under the lead (the site's "Coming soon"). */
	status: string
}

export const templatesWallContent: TemplatesWallContent = {
	headline: 'Build your own',
	names: ['Ad library', 'Creator sourcing tool', 'Competitor monitor', 'Trend tracker'],
	lead: 'Ready-made playbooks that run inside your agent on Spyglass data.',
	status: 'Coming soon',
}

// ----- The templates page (site app/templates/page.tsx): the wall as the hero, the automation run, what each template
// brings back (TemplateCities: a row per template fanning out its items), the questions and the close. -----

export interface TemplateCityItem {
	key: string
	/** The item's picture (the user's own); none draws the neutral placeholder. */
	src?: string
	alt: string
	title: string
	meta?: string
}

export interface TemplateCityRow {
	key: string
	name: string
	href: string
	/** The line under the row's name when it opens. */
	line: string
	items: TemplateCityItem[]
}

const acme = (key: string, n: number, meta: (i: number) => string): TemplateCityItem[] =>
	Array.from({ length: n }, (_, i) => ({ key: `${key}-${i + 1}`, alt: `Acme creative ${i + 1}`, title: 'Acme', meta: meta(i) }))

export const templatesPageContent = {
	wall: templatesWallContent,
	cities: {
		id: 'templates-cities',
		headline: 'What each template brings back',
		lead: 'Coming soon. Real ads, creators and posts, the kind each one will send your agent.',
		status: templatesWallContent.status,
		rows: [
			{ key: 'adLibrary', name: 'Ad library', href: '/use-cases/paid-ads', line: 'Every morning at 8:00, every ad from the brands you follow.', items: acme('ads', 10, (i) => `Ad, ${[74, 26, 48, 12, 9, 31, 5, 17, 40, 22][i]} days live`) },
			{ key: 'creators', name: 'Creator sourcing tool', href: '/use-cases/creator-sourcing', line: 'Every Friday at 10:00, creators who fit your audience, place and size.', items: acme('creators', 10, () => 'Creator post') },
			{ key: 'monitor', name: 'Competitor monitor', href: '/use-cases/competitive-analysis', line: "Every Monday at 8:00, a competitor's new ads, pages and creators.", items: acme('monitor', 10, (i) => (i % 3 === 1 ? 'Landing page' : 'Ad')) },
			{ key: 'trends', name: 'Trend tracker', href: '/use-cases/organic-social', line: 'Every day at 7:00, the hooks gaining share in your category.', items: acme('trends', 10, (i) => `Post, ${['275.5K', '652.9K', '36.3K', '28.2K', '91K'][i % 5]} views`) },
		] satisfies TemplateCityRow[],
	},
	faq: {
		id: 'templates-faq',
		headline: 'Frequently asked questions',
		lead: 'What a template is, where it runs and what it costs.',
		docs: { label: 'Read the docs', href: '/docs' },
		items: [
			{ q: 'What is a template?', a: 'A ready-made playbook your agent runs on Spyglass data. It holds the question, the data it needs and what to send back. You start from something that already works.' },
			{ q: 'Where does a template run?', a: 'Inside your agent, through the Spyglass MCP server. Each run reads Spyglass data and brings the answer back to the chat.' },
			{ q: 'How do the schedule and test mode work?', a: 'Every template runs on a schedule by default, like every Monday at 8:00. Run it once in test mode first to see what comes back.' },
			{ q: 'What does a template cost?', a: 'Each run uses credits from the same pool as the API and the MCP server. Every account gets 500 free credits a month.' },
		],
	},
	close: {
		lines: ['Templates run on the Spyglass API.', 'Start today'],
		note: '500 free credits every month. No card required.',
		primary: { label: 'Get a free API key', href: '/sign-up' },
		secondary: { label: 'Read the docs', href: '/docs' },
	},
}
