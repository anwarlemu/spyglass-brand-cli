// The blog post template's copy: a neutral example post by the team, with Acme placeholders. Both flavors read this file.
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

// A block of the post's body. Written out in place (no type alias), so the web component's generated types stand alone.
const body: ({ kind: 'p' | 'h2' | 'quote'; text: string } | { kind: 'list'; items: string[] } | { kind: 'figure'; caption: string; images: CreativeImage[] })[] = [
	{ kind: 'p', text: 'A brand’s best ad tells you what worked once. A week of its ads tells you what it believes. Start with the week.' },
	{ kind: 'h2', text: 'Count formats first.' },
	{ kind: 'p', text: 'Sort the week by format before you look at a single hook. UGC, studio, static, carousel. The split is the strategy.' },
	{ kind: 'list', items: ['Pull seven days of ads for one brand.', 'Tag each one by format.', 'Note which formats got new versions.'] },
	{ kind: 'figure', caption: 'Three of Acme Skin’s ads from one week, side by side.', images: [creative('Acme Skin', 3, 'Glow in two steps.'), creative('Acme Skin', 2, 'The travel kit.'), creative('Acme Skin', 4, 'Night repair.')] },
	{ kind: 'h2', text: 'Then read the hooks.' },
	{ kind: 'p', text: 'Hooks repeat inside a format. When a brand ships the same opening three times, it is working.' },
	{ kind: 'quote', text: 'The split is the strategy. The hook is the tactic.' },
	{ kind: 'p', text: 'Write down what changed since last week. That list is your brief.' },
]

export const blogPostContent = {
	header: { ...header, nav: nav.map((l) => (l.href === '/blog' ? { ...l, current: true } : l)) },
	back: { label: 'Blog', href: '/blog' },
	date: 'Nov 12, 2026',
	category: 'Research',
	title: 'How to read a competitor’s creative mix.',
	byline: 'By the Spyglass team',
	image: creative('Acme Skin', 3),
	body,
	related: {
		title: 'More from the blog.',
		posts: [
			{ href: '/blog/skincare-hooks', title: 'Five hooks that keep working in skincare ads.', date: 'Nov 5, 2026', image: creative('Acme Skin', 2) },
			{ href: '/blog/swipe-files', title: 'A swipe file your team will use.', date: 'Oct 29, 2026', image: creative('Acme Studio', 4) },
			{ href: '/blog/launch-week', title: 'What a launch week looks like in the index.', date: 'Oct 22, 2026', image: creative('Acme Drinks', 1) },
		],
	},
	offer: { headline: 'Stop screenshotting at midnight.', note: '$10 for your first month, then $20/month', cta: { label: 'Start Creator for 50% off', href: '/pricing' } },
	footer,
}

export type BlogPostContent = typeof blogPostContent
export type BlogPostBlock = (typeof body)[number]
