// The about page's copy (site content/pages/about.ts): the head, the strip of photos (the site's light tiles at both
// ends and Acme placeholders where a team's own photos go), the story and the benefits. Both flavors read this file.

import type { ImageSlot } from '@/lib/image'

// The header's five pages and the sign-in, the footer's six columns and Acme's legal line.
const shell = {
	header: {
		nav: [
			{ label: 'Products', href: '/products' },
			{ label: 'Use cases', href: '/use-cases' },
			{ label: 'Enterprise', href: '/enterprise' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Pricing', href: '/pricing' },
		],
		secondary: { label: 'Sign in', href: '/sign-in' },
	},
	footer: {
		columns: [
			{ title: 'Products', wide: true, links: [{ label: 'Brands and creators', href: '/products/brand-search' }, { label: 'Media archive', href: '/products/media-search' }, { label: 'Collaborations', href: '/products/creator-collabs' }, { label: 'Creative insights', href: '/products/creative-insights' }, { label: 'Realtime search', href: '/products/realtime-search' }, { label: 'Coming soon', href: '/products' }] },
			{ title: 'Use cases', wide: true, links: [{ label: 'Build your own', href: '/use-cases/build' }, { label: 'Creative research', href: '/use-cases/creative-research' }, { label: 'Paid ads', href: '/use-cases/paid-ads' }, { label: 'Organic social', href: '/use-cases/organic-social' }, { label: 'Competitive analysis', href: '/use-cases/competitive-analysis' }, { label: 'Creator sourcing', href: '/use-cases/creator-sourcing' }] },
			{ title: 'Resources', links: [{ label: 'Templates', href: '/templates' }, { label: 'Docs', href: '/docs' }, { label: 'Blog', href: '/resources/blog' }, { label: 'Articles', href: '/resources/articles' }] },
			{ title: 'Company', links: [{ label: 'Enterprise', href: '/enterprise' }, { label: 'About', href: '/about' }, { label: 'Careers', href: '/about#careers' }, { label: 'Talk to us', href: '/enterprise#talk' }, { label: 'Sign in', href: '/sign-in' }] },
			{ title: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }] },
			{ title: 'Community', links: [{ label: 'X', href: 'https://x.com' }, { label: 'LinkedIn', href: 'https://linkedin.com' }, { label: 'Instagram', href: 'https://instagram.com' }] },
		],
		legal: '© 2026 Acme Inc.',
	},
}

/** One tile in the strip: your photo (`src`, with `alt`, `fit` and `position`), one of the site's light tiles (`light`), or an empty tile. */
export interface AboutPhoto extends ImageSlot {
	/** The site's light tile b or c instead of a photo. */
	light?: 'b' | 'c'
	/** Two columns wide. */
	wide?: boolean
}

export const aboutContent = {
	shell,
	id: 'about',
	head: {
		lines: ['Come help the world', 'look closer'],
		lead: 'We’re looking for people who notice what others miss.',
		primary: { label: 'Join us', href: 'mailto:careers@acme.com' },
	},
	film: 'The team',
	photos: [{ light: 'b' }, { alt: '' }, { alt: '' }, { alt: '', wide: true }, { alt: '' }, { light: 'c' }] as AboutPhoto[],
	story: {
		headline: 'Spyglass is where the internet’s creative comes into focus.',
		paragraphs: [
			'It’s where marketers and their agents come to see what’s working across ads, posts and creators. Now, we’re building the record behind it: every brand, every channel, ready for any agent to search.',
			'We’re a small team that obsesses over craft and moves quickly. Every detail we ship is one we’d want to use ourselves.',
			'Teams in many countries already brief from Spyglass, from founders running their first ads to global agencies.',
			'If you care about craft, curiosity and doing the best work of your career, come build with us.',
		],
	},
	perks: {
		id: 'careers',
		headline: 'Benefits',
		lead: 'We take care of the people doing the work.',
		groups: [
			{ title: 'Focus', items: ['Top-spec hardware', 'Every AI tool you need', 'Lunch on us'] },
			{ title: 'Culture', items: ['Seasonal offsites', 'Team dinners', 'Friday demos'] },
			{ title: 'Care', items: ['Full health cover', 'Generous time off', 'Learning budget'] },
		],
	},
}

export type AboutContent = typeof aboutContent

/** The about page's sections in order; pass `sections` to reorder them or leave some out. */
export const aboutSections = ['head', 'photos', 'story', 'perks'] as const
export type AboutSection = (typeof aboutSections)[number]
