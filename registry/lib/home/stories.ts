// The home's case stories (site v3/V3CaseStories with content/pages/caseStudies and content/v3/stories), as Acme
// placeholders: the site shows its customers' names, marks, photos and quotes, which never ship. Pass your own through
// `cases` and `quotes`. Both flavors read this file.

import type { ImageSlot } from '@/lib/image'

export interface StoryMark {
	/** The mark's file (SVG or PNG), drawn as a mask in the soft gray. */
	src: string
	/** Its width over its height. */
	ratio: number
	/** Its height in px (16 to 32; 20 in a lead story). */
	h?: number
}

export interface StoryQuote {
	company: string
	mark?: StoryMark
	quote: string
	name: string
	/** Role and company, under the name. */
	role: string
	/** A 40px photo; the initials stand in without one. */
	photo?: string
}

export interface StoryCase extends StoryQuote {
	/** The headline figure and what it counts. */
	stat: string
	statLabel: string
	href: string
	/** The lead picture: an image ({ src, alt, fit, position }), or a placeholder tone (1 to 4). */
	picture?: ImageSlot & { tone?: 1 | 2 | 3 | 4 }
}

export interface CaseStoriesContent {
	headline: string
	lead: string
	/** The link's words on a lead story ("Read the case study"). */
	read: string
}

export const caseStoriesContent: CaseStoriesContent = {
	headline: 'Marketing teams on Spyglass',
	lead: 'Marketers, founders and agencies on how they research creative now.',
	read: 'Read the case study',
}

export const storyCases: StoryCase[] = [
	{ company: 'Acme Social', stat: '12 hours', statLabel: 'saved per strategist every week', quote: 'Most of our client report is written before anyone opens a deck.', name: 'Alex Rivera', role: 'Creative strategy lead, Acme Social', href: '/resources/case-studies/acme-social', picture: { tone: 3 } },
	{ company: 'Acme Studio', stat: '140', statLabel: 'creators shortlisted in one afternoon', quote: 'The shortlist came back as a table we sent straight to outreach.', name: 'Jordan Lee', role: 'Head of creator partnerships, Acme Studio', href: '/resources/case-studies/acme-studio', picture: { tone: 2 } },
]

export const storyQuotes: StoryQuote[] = [
	{ company: 'Acme Agency', quote: 'Agencies can’t afford blind spots. This gives us full competitive visibility across every account we manage.', name: 'Sam Carter', role: 'COO, Acme Agency' },
	{ company: 'Acme Goods', quote: 'Creators, competitor tracking, trend research: all in one place. The most underrated tool we use.', name: 'Riley Park', role: 'Performance marketer, Acme Goods' },
	{ company: 'Acme Health', quote: 'The first platform to really crack creative research. The team listens, ships and iterates.', name: 'Morgan Diaz', role: 'Chief customer officer, Acme Health' },
]

export const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2)
