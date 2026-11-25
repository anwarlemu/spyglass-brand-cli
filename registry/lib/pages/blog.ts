// The blog index template's copy: neutral example posts by the team, with Acme placeholders. Replace them with real posts. Both flavors read this file.
import type { CreativeImage } from '@/lib/image'
/** An Acme placeholder creative: the advertiser, a neutral tone (1 to 4) and a headline. */
const creative = (brand: string, tone: 1 | 2 | 3 | 4, caption?: string): CreativeImage => (caption ? { brand, tone, caption } : { brand, tone })

const nav = [
	{ label: 'Product', href: '/product' },
	{ label: 'Pricing', href: '/pricing' },
	{ label: 'Changelog', href: '/changelog' },
	{ label: 'Blog', href: '/blog' },
]
const footer = {
	domain: 'spyglass.so',
	links: [
		{ label: 'Product', href: '/product' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'About', href: '/about' },
		{ label: 'Changelog', href: '/changelog' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'Terms', href: '/legal' },
	],
}
const header = { nav, secondary: { label: 'Sign in', href: '/sign-in' }, cta: { label: 'Get 50% off', href: '/pricing' } }

export const blogPosts = [
	{ href: '/blog/competitor-creative-mix', title: 'How to read a competitor’s creative mix.', excerpt: 'Count formats before you judge hooks. A week of one brand’s ads says more than its best one.', date: 'Nov 12, 2026', category: 'Research', image: creative('Acme Skin', 3) },
	{ href: '/blog/skincare-hooks', title: 'Five hooks that keep working in skincare ads.', excerpt: 'Before and after still leads. Here is what the rest of the top ads open with.', date: 'Nov 5, 2026', category: 'Hooks', image: creative('Acme Skin', 2) },
	{ href: '/blog/swipe-files', title: 'A swipe file your team will use.', excerpt: 'Boards work when each one answers a single question.', date: 'Oct 29, 2026', category: 'Boards', image: creative('Acme Studio', 4) },
	{ href: '/blog/launch-week', title: 'What a launch week looks like in the index.', excerpt: 'Acme Drinks shipped 40 creatives in seven days. We followed every one.', date: 'Oct 22, 2026', category: 'Research', image: creative('Acme Drinks', 1) },
	{ href: '/blog/ugc-or-studio', title: 'UGC or studio: what the numbers say.', excerpt: 'We sorted 1,000 Acme ads by format. The split was closer than we thought.', date: 'Oct 15, 2026', category: 'Formats', image: creative('Acme Fit', 3) },
	{ href: '/blog/briefs-from-changes', title: 'Write the brief from what changed.', excerpt: 'Start Monday with the five changes that matter, not fifty screenshots.', date: 'Oct 8, 2026', category: 'Briefs', image: creative('Acme Studio', 2) },
]

export const blogContent = {
	header: { ...header, nav: nav.map((l) => (l.href === '/blog' ? { ...l, current: true } : l)) },
	title: 'Blog.',
	body: 'What we learn from the creatives in the index.',
	read: 'Read the post',
	posts: blogPosts,
	footer,
}

export type BlogContent = typeof blogContent
export type BlogPost = (typeof blogPosts)[number]

/** The blog index's sections in order; pass `sections` to reorder them or leave some out. */
export const blogSections = ['head', 'featured', 'posts'] as const
export type BlogSection = (typeof blogSections)[number]
