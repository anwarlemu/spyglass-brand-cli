// The case study pages' copy (the site's content/pages/caseStudies.ts), retold for the two Acme agencies the home's
// case stories show (lib/home/stories.ts): no real customers, people, quotes or pictures. The lead picture comes through `cover` (an image you may show); without it the
// page draws a neutral placeholder. Both flavors read this file.
import { siteChrome } from '@/lib/pages/site-chrome'
import { storyCases, storyQuotes, type StoryCase, type StoryQuote } from '@/lib/home/stories'
import type { ImageSlot } from '@/lib/image'

export interface CaseStudyFigure {
	value: string
	label: string
}

export interface CaseStudySection {
	title: string
	paragraphs: string[]
}

export interface CaseStudy {
	slug: string
	company: string
	/** The kind of company, as a badge under the title. */
	kind: string
	headline: string
	lead: string
	figures: CaseStudyFigure[]
	facts: { label: string; value: string }[]
	/** The products it uses, linked in the facts. */
	uses: { label: string; href: string }[]
	/** The pull quote and who said it (a role, or a name you may print). */
	quote: { text: string; name: string; role?: string }
	/** A second, shorter quote after the second section. */
	aside?: { text: string; name: string }
	sections: CaseStudySection[]
	/** The lead picture (16:9, 4:5 on phones); a neutral placeholder without it. */
	cover?: ImageSlot & { brand?: string }
}

export const caseStudies: CaseStudy[] = [
	{
		slug: 'acme-social',
		company: 'Acme Social',
		kind: 'Paid social agency',
		headline: 'How Acme Social briefs nine client brands from one agent',
		lead: 'Competitor ads, hooks and landing pages for every client, pulled before the Monday stand-up.',
		figures: [
			{ value: '12 hours', label: 'saved per strategist every week' },
			{ value: '9', label: 'client brands briefed from one agent' },
			{ value: '3x', label: 'more hooks tested a month, in one quarter' },
		],
		facts: [
			{ label: 'Agency', value: 'Acme Social' },
			{ label: 'Team', value: 'Paid social, 24 people' },
			{ label: 'Clients', value: '9 beauty and wellness brands' },
		],
		uses: [
			{ label: 'Media API', href: '/products/media-search' },
			{ label: 'Creative insights', href: '/products/creative-insights' },
			{ label: 'Landing Pages API', href: '/products/landing-pages' },
		],
		quote: { text: 'Most of our client report is written before anyone opens a deck.', name: 'Alex Rivera', role: 'Creative strategy lead, Acme Social' },
		aside: { text: 'We stopped arguing about what competitors were running. We just ask.', name: 'Alex Rivera' },
		sections: [
			{
				title: 'The challenge',
				paragraphs: [
					"Every Monday, each strategist spent half a day in ad libraries: screenshotting competitors' new ads, guessing how long they had run and pasting them into a deck for the client.",
					'With nine brands in three categories, the research was always a week old by the time it reached a brief.',
				],
			},
			{
				title: 'What they built',
				paragraphs: [
					'Acme Social connected Acme to Claude over MCP and wrote one prompt per client: the competitors to watch, the hooks to track and the formats that matter.',
					"Each Monday the agent pulls every new ad, the hooks behind them and where each one leads, and drafts the client's competitor page in the agency's own template.",
				],
			},
			{
				title: 'The result',
				paragraphs: ['Strategists start the week reading a brief instead of building one. The time went back into testing: three times as many hooks a month, picked from what is already working in the category.'],
			},
		],
		cover: { brand: 'Acme Skin' },
	},
	{
		slug: 'acme-studio',
		company: 'Acme Studio',
		kind: 'Creator and performance agency',
		headline: "How Acme Studio finds the creators behind a category's best ads",
		lead: 'A shortlist of proven creators in an afternoon, from the ads and posts that are already working.',
		figures: [
			{ value: '140', label: 'creators shortlisted in one afternoon' },
			{ value: '2 weeks', label: 'of manual sourcing cut to a day' },
			{ value: '31%', label: 'lower cost per acquisition on creator ads' },
		],
		facts: [
			{ label: 'Agency', value: 'Acme Studio' },
			{ label: 'Team', value: 'Creator partnerships, 11 people' },
			{ label: 'Clients', value: 'Running, outdoor and apparel brands' },
		],
		uses: [
			{ label: 'Creator search', href: '/products/creator-search' },
			{ label: 'Collaborations', href: '/products/creator-collabs' },
			{ label: 'Media API', href: '/products/media-search' },
		],
		quote: { text: 'The shortlist came back as a table we sent straight to outreach.', name: 'Jordan Lee', role: 'Head of creator partnerships, Acme Studio' },
		aside: { text: 'We only reach out to creators whose ads already ran for a brand like ours.', name: 'Jordan Lee' },
		sections: [
			{
				title: 'The challenge',
				paragraphs: [
					'Sourcing meant scrolling: hashtags, follower counts and gut feel, then weeks of outreach to creators who had never made an ad that worked.',
					'Clients wanted creators with a record, and the agency had no way to see who already had one.',
				],
			},
			{
				title: 'What they built',
				paragraphs: [
					"Acme Studio asks for the longest-running creator ads in a client's category, then for every creator those brands have worked with, their reach and where they post.",
					"The answer lands as one table, ranked by how long each creator's ads kept running, and goes straight into the outreach sheet.",
				],
			},
			{
				title: 'The result',
				paragraphs: ['A shortlist that took two weeks now takes an afternoon, and every creator on it has already made an ad a brand kept paying for.'],
			},
		],
		cover: { brand: 'Acme Fit' },
	},
]

export const caseStudyContent = {
	...siteChrome,
	labels: {
		/** The breadcrumb's first step and where it links. */
		all: { label: 'Case studies', href: '/resources/case-studies' },
		more: 'More case studies',
		uses: 'Uses',
		previous: 'Previous case study',
		next: 'Next case study',
		/** How a read time reads, from minutes. */
		read: (minutes: number) => `${minutes} min read`,
	},
	/** Where a study's page lives, from its slug. */
	href: (slug: string) => `/resources/case-studies/${slug}`,
	studies: caseStudies,
}

export type CaseStudyContent = typeof caseStudyContent

/** Minutes to read a study at 220 words a minute, at least 1. */
export function caseStudyMinutes(study: CaseStudy): number {
	const words = [study.lead, ...study.sections.flatMap((s) => [s.title, ...s.paragraphs]), study.quote.text].join(' ').split(/\s+/).length
	return Math.max(1, Math.round(words / 220))
}

/** The studies before and after this one, wrapping; `previous` is left out when it is the same as `next`. */
export function caseStudyNeighbors(studies: CaseStudy[], slug: string): { previous?: CaseStudy; next?: CaseStudy } {
	if (studies.length < 2) return {}
	const at = Math.max(0, studies.findIndex((s) => s.slug === slug))
	const previous = studies[(at - 1 + studies.length) % studies.length]
	const next = studies[(at + 1) % studies.length]
	return { previous: previous.slug === next.slug ? undefined : previous, next }
}

/** The case studies index (the site's CaseStudyIndex): the page head over the home's case stories, every quote shown. */
export const caseStudiesIndexContent = {
	...siteChrome,
	head: { id: 'case-studies', lines: ['Case studies'], lead: 'How agencies and marketing teams put Acme to work, in their own words.' },
	cases: storyCases as StoryCase[],
	quotes: [
		...storyQuotes,
		{ company: 'Acme Signals', quote: 'Sharp, intuitive, and built by a team that ships fixes the same day. The easiest pick for anyone serious about creative research.', name: 'Casey Brooks', role: 'Founder, Acme Signals' },
		{ company: 'Acme Energy', quote: 'The only creative tool that shows me what my audience actually sees. Finding new audiences has never been easier.', name: 'Taylor Quinn', role: 'GM, Acme Energy' },
		{ company: 'Acme Bottle', quote: 'We built the brand by obsessing over our customers. This shows us the creative they engage with, from brands to creators.', name: 'Jamie Ellis', role: 'Co-founder, Acme Bottle' },
	] as StoryQuote[],
}

export type CaseStudiesIndexContent = typeof caseStudiesIndexContent
