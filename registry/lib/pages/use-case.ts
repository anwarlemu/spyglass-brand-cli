// A use case page's copy (site app/use-cases/[slug], pages/UseCasesPage/UseCaseDetail, content/pages/use-cases.ts,
// useCasePages and useCaseStories), here creative research with Acme's stories: the hero, the proof line, the scroll
// story and its buttons, the stories head, the FAQ and the docs button. Both flavors read this file; the header,
// footer and close come from lib/pages/site-chrome.ts.
import { useCaseHeroContent, type UseCaseHeroContent } from '@/lib/use-case-hero'
import type { Story } from '@/lib/stories'
import type { StoryAction } from '@/lib/scroll-story'
import type { ScrollStoryPreset } from '@/lib/pages/scroll-stories'
import { siteChrome, type SiteChrome } from '@/lib/pages/site-chrome'
import type { ScrollStoryData } from '@/lib/scroll-story'
import type { WheelItem } from '@/lib/use-case-wheel'

export interface UseCaseFaqItem {
	q: string
	a: string
}

export interface UseCaseContent {
	/** The page's slug: the stem of every section's id. */
	slug: string
	hero: UseCaseHeroContent
	/** The White button's place: the connect menu (`mcp`) or the hero's own White button (`buttons`). */
	control: 'mcp' | 'buttons'
	proof: string
	story: { preset: ScrollStoryPreset; actions: StoryAction[] }
	stories: { headline: string; lead: string; items: Story[] }
	faq: { headline: string; lead: string; docs: { label: string; href: string }; items: UseCaseFaqItem[] }
	chrome: SiteChrome
}

export const useCaseContent: UseCaseContent = {
	slug: 'creative-research',
	hero: { ...useCaseHeroContent, primary: { label: 'Connect to MCP', href: '/docs/mcp' }, secondary: { label: 'Get a free API key', href: '/sign-up' } },
	control: 'mcp',
	proof: 'Trusted by teams and agents at',
	story: {
		preset: 'research',
		actions: [
			{ label: 'Get a free API key', href: '/sign-up' },
			{ label: 'See templates', href: '/templates' },
		],
	},
	stories: {
		headline: 'Creative research, in their words',
		lead: 'A customer officer, a founder and a GM on researching creative.',
		items: [
			{ company: 'Acme Labs', quote: 'The first platform to really crack creative research. Not incrementally better, ten times better. We listen, ship and iterate.', name: 'Sam', role: 'Chief customer officer' },
			{ company: 'Acme Studio', quote: 'Sharp, intuitive and built by a team that ships fixes the same day. The easiest recommendation I can make for any creative research.', name: 'Jo', role: 'Founder' },
			{ company: 'Acme Air', quote: 'The only creative tool that shows me what our audience actually sees. Finding trends and new audiences has never been easier.', name: 'Ari', role: 'General manager' },
		],
	},
	faq: {
		headline: 'Frequently asked questions',
		lead: 'Every filter and limit is in the docs.',
		docs: { label: 'Read the docs', href: '/docs' },
		items: [
			{ q: 'Who is it for?', a: 'Creative strategists, designers and performance teams who need to know which hooks, angles and formats work before they brief the next round.' },
			{ q: 'What does it read in a creative?', a: 'The hook, the angle, who it is made for, its format and its funnel stage. Every ad and post is analyzed for these before it reaches you.' },
			{ q: 'Do I wait for the analysis?', a: 'No. A brand’s top hooks, angles and personas are worked out ahead of time, over up to the last 90 days. Your agent asks and gets the answer back at once.' },
			{ q: 'Can I research a whole category?', a: 'Yes. Search every indexed ad and post by what is in it, a scene, a line, a style, and see which brands use it, how long their ads run and the views their posts get.' },
			{ q: 'Does it show what an ad spent?', a: 'No. Counts are ads, run length is how long an ad stayed live and views are how a post did. None says what a brand spent or sold, and none claims it does.' },
		],
	},
	chrome: siteChrome,
}

/** The use case page's sections in order; pass `sections` to reorder them or leave some out. */
export const useCaseSections = ['hero', 'proof', 'story', 'stories', 'wheel', 'faq', 'close'] as const
export type UseCaseSection = (typeof useCaseSections)[number]

/** Each block's own data, pictures included (Acme placeholders where left out). */
export interface UseCaseBlocks {
	/** The scroll story's data in place of its preset (lib/scroll-story.ts; its images take `src`, `alt`, `fit`, `position`). */
	story?: { story?: ScrollStoryData }
	/** The wheel's audiences, each with three pairs of pictures. */
	wheel?: { items?: WheelItem[] }
}
