// The product page's copy: one template for every product, as the site's /products/[slug] (content/pages/products.ts,
// productPages, productHeroes, productCompare). Three products are filled in, one per kind of page: Creator search
// (records and filters, with the comparison), Comments (threads and themes) and Landing pages (pages and the links
// board). The products, features, questions and rates are the site's own; every result, person and brand in the
// pictures is Acme, with figures in place of photos. Both flavors read this file.
import type { HeroResult, HeroSet } from '@/lib/product-hero'
import type { ProductVisualKind, ProductVisualDataMap } from '@/lib/product-visual-data'
import { siteChrome } from '@/lib/pages/site-chrome'
import type { ImageSlot } from '@/lib/image'

export interface ProductPageFeature {
	headline: string
	text: string
	link?: { label: string; href: string }
	visual: ProductVisualKind
	/** The visual's content, pictures included (product-visual's `data` for its kind); Acme placeholders without it. */
	data?: ProductVisualDataMap[ProductVisualKind]
}
export interface ProductPageContent {
	slug: string
	name: string
	line: string
	docs: string
	hero: { sets: HeroSet[]; lit?: boolean }
	features: ProductPageFeature[]
	compare?: { label: string; cells: string[] }[]
	/** The receipt: each row's 4:5 `picture` (a src or { src, alt, fit, position }) replaces its neutral block. */
	pricing: { value: string; unit: string; rows: { name: string; meta: string; picture?: string | ImageSlot }[]; free: { name: string; meta: string; picture?: string | ImageSlot }; tally: string }
	faq: { q: string; a: string }[]
}

const result = (id: string, label: string, meta: string, stat: [string, string], title: string, facts: [string, string][], notes?: string[]): HeroResult => ({
	id, label, meta, stat: { value: stat[0], caption: stat[1] }, ...(notes ? { notes } : {}), detail: { title, facts: facts.map(([term, value]) => ({ term, value })) },
})

// A result whose face is a comment chip, as the site's comments hero sets them (a neutral face, no photo).
const note = (id: string, label: string, meta: string, chip: string, facts: [string, string][]): HeroResult => ({ id, label, meta, notes: [chip], detail: { title: label, facts: facts.map(([term, value]) => ({ term, value })) } })

const agents = { label: 'Ready for your agents over MCP', cells: ['no', 'You build it', 'yes'] }

export const productPages: Record<'creator-search' | 'comments' | 'landing-pages', ProductPageContent> = {
	'creator-search': {
		slug: 'creator-search',
		name: 'Creator search',
		line: 'Find creators by name, handle or description. Filter by location, language, gender, age and followers.',
		docs: '/docs/api-reference/search-creators',
		hero: {
			sets: [
				{
					question: 'Find fitness creators in Texas with 50K to 500K followers.',
					resultsLabel: 'Fitness creators in Texas',
					results: [
						result('acmefit', '@acmefit', '367K followers, Austin', ['367K', 'followers on Instagram'], 'Acme Fit', [['Instagram', '367K followers'], ['Location', 'Austin, Texas'], ['Focus', 'Functional workouts and recovery'], ['Age', '25 to 34']]),
						result('acmerun', '@acmerun', '457K followers, Austin', ['457K', 'followers on Instagram'], 'Acme Run', [['Instagram', '457K followers'], ['Location', 'Austin, Texas'], ['Focus', 'Beginner strength and running'], ['Age', '25 to 34']]),
						result('acmegym', '@acmegym', '194K followers, Amarillo', ['194K', 'followers on Instagram'], 'Acme Gym', [['Instagram', '194K followers'], ['Location', 'Amarillo, Texas'], ['Focus', 'Home-gym workouts and nutrition'], ['Age', '25 to 34']]),
					],
				},
				{
					question: 'Which yoga creators in Houston post in Spanish?',
					resultsLabel: 'Yoga creators in Houston who post in Spanish',
					results: [
						result('acmeyoga', '@acmeyoga', '212K followers, Houston', ['212K', 'followers on TikTok'], 'Acme Yoga', [['TikTok', '212K followers'], ['Location', 'Houston, Texas'], ['Language', 'Spanish']], ['Spanish']),
						result('acmeflow', '@acmeflow', '96K followers, Houston', ['96K', 'followers on Instagram'], 'Acme Flow', [['Instagram', '96K followers'], ['Location', 'Houston, Texas'], ['Language', 'Spanish and English']], ['Spanish']),
					],
				},
			],
		},
		features: [
			{ headline: 'Search creators by name or by description', text: 'Use a name, a handle or a plain brief, like fitness creators in Texas. Filter by location, language, gender, age range and followers.', visual: 'creator-filters' },
			{ headline: 'Every creator comes with their audience', text: 'Get their handles and followers on Instagram and TikTok, what they post about, where they are, their age range and engagement.', visual: 'creator-record' },
			{ headline: 'See who already works with your competitors', text: 'Look up a brand to see the creators it has posted with, how often and since when. Start your shortlist there.', link: { label: 'See Creator collabs', href: '/products/creator-collabs' }, visual: 'collabs-timeline' },
			{ headline: 'Add any creator who is missing', text: 'Missing brands and creators can be added on request and are indexed automatically. Give an Instagram handle. Search them once they read ready.', visual: 'add-creator' },
		],
		compare: [
			{ label: 'Find creators by niche, place and followers', cells: ['no', 'no', 'yes'] },
			{ label: 'One record across Instagram and TikTok', cells: ['no', 'You match them', 'yes'] },
			{ label: 'The brands they have worked with', cells: ['no', 'no', 'yes'] },
			agents,
		],
		pricing: { value: '1 credit', unit: 'per creator found', rows: [{ name: 'Acme Fit', meta: '@acmefit' }, { name: 'Acme Run', meta: '@acmerun' }, { name: 'Acme Gym', meta: '@acmegym' }], free: { name: 'Add a missing creator', meta: 'Indexed automatically' }, tally: '3 creators found' },
		faq: [
			{ q: 'What can I search creators by?', a: 'A name, an Instagram or TikTok handle, an id, or a plain description of who you need. Filter any search by location, language, gender, age range and followers.' },
			{ q: 'How many creators does one search return?', a: '20 by default, up to 100 a call. A search by description returns up to 50. Every creator found costs one credit, so ask for only the matches you need.' },
			{ q: 'What does a search cost?', a: 'One credit per creator found. A search by description runs a language model, so it bills at least one creator, even with no match. A lookup by name, handle or id that finds nothing is free.' },
			{ q: 'What comes with each creator?', a: 'Name, summary and bio. Handles, followers and engagement on Instagram and TikTok. Location, language, gender and age range. Their posts and views are in Media search.' },
			{ q: 'What if a creator is not indexed?', a: 'Add them with their Instagram handle, up to 20 at a time. They are indexed automatically. Adding a creator and checking their status are free.' },
			{ q: 'Can my agent search creators?', a: 'Yes. Add the MCP server to any MCP client and ask in plain words. Or call the REST API with a key. Both use the same credits, and a failed request is never billed.' },
		],
	},
	comments: {
		slug: 'comments',
		name: 'Comments',
		line: 'Read the public comments on any Instagram or TikTok post.',
		docs: '/docs/api-reference/comments',
		hero: {
			sets: [
				{
					question: 'What are people saying under Acme Studio’s latest posts?',
					resultsLabel: 'What people ask under Acme Studio’s posts',
					results: [
						note('restock', 'Ask for a restock', '34% of comments', 'Restock the white set please', [['Theme', 'Restock requests'], ['Comments', '412 of 1,204'], ['Top comment', '312 likes']]),
						note('wear', 'Plan to wear it', '22% of comments', 'Need this for Saturday’s match', [['Theme', 'Plans to wear it'], ['Comments', '268 of 1,204'], ['Top comment', '148 likes']]),
						note('styling', 'Love the styling', '18% of comments', 'The styling is perfect', [['Theme', 'Praise for the styling'], ['Comments', '216 of 1,204'], ['Top comment', '96 likes']]),
						note('sizing', 'Ask about sizing', '15% of comments', 'What size is she wearing?', [['Theme', 'Sizing questions'], ['Comments', '180 of 1,204'], ['Top comment', '88 likes']]),
						note('shipping', 'Ask about shipping', '11% of comments', 'Will this ship to London?', [['Theme', 'Shipping questions'], ['Comments', '128 of 1,204'], ['Top comment', '64 likes']]),
					],
				},
			],
		},
		features: [
			{ headline: 'Read the comments under any public post', text: 'Instagram posts and reels, and TikTok videos. Each comment comes with its author, likes and replies. Ask about one post or a brand’s latest, up to 20 at once.', visual: 'comment-thread' },
			{ headline: 'Find what people keep asking for', text: 'Your agent groups the comments into questions, tags and praise, and finds the ones that repeat. Bring them to your next brief.', visual: 'comment-themes' },
			{ headline: 'Start from the posts that are working', text: 'Find a category’s outlier posts in Media search: the ones that beat their account’s usual numbers. Then read the comments under them, yours and your competitors’.', link: { label: 'See Organic social', href: '/use-cases/organic-social' }, visual: 'posts-narrow' },
		],
		pricing: { value: '5 credits', unit: 'per page of comments', rows: [{ name: 'White set post, page 1', meta: '@acmestudio, Instagram' }, { name: 'Fleece post, page 1', meta: '@acmestudio, Instagram' }, { name: 'Match day post, page 1', meta: '@acmestudio, Instagram' }], free: { name: 'A post already cached', meta: 'Comments read free' }, tally: '3 pages of comments' },
		faq: [
			{ q: 'Which posts can I read comments on?', a: 'Public Instagram posts and reels, and public TikTok videos. Organic posts only: comments on Meta ads are not available.' },
			{ q: 'What does it cost?', a: '5 credits per page of comments fetched live. Comments on posts already cached are free. A failed request is never billed.' },
			{ q: 'How many comments can I get at once?', a: 'One page per post by default, up to 20 pages. One request covers up to 20 Instagram posts and 20 TikTok videos.' },
			{ q: 'What comes with each comment?', a: 'The comment, its author and whether they are verified, its likes and replies, when it was posted, and whether it is pinned.' },
			{ q: 'How do I find the posts worth reading?', a: 'Search posts in Media search and sort by outlier score, views or engagement. Then ask for the comments on the ones that stand out, yours or a competitor’s.' },
			{ q: 'Can my agent read comments?', a: 'Yes. Add the MCP server to any MCP client and ask in plain words. Or call the REST API with a key. Both use the same credits.' },
		],
	},
	'landing-pages': {
		slug: 'landing-pages',
		name: 'Landing pages',
		line: 'Where a brand sends its ads, ranked by how many ads point to each page.',
		docs: '/docs/api-reference/landing-pages',
		hero: {
			sets: [
				{
					question: 'Where does Acme Goods send its ads?',
					resultsLabel: 'Acme Goods’ top landing pages',
					results: [
						result('black', '/pages/black-edition', '212 ads point here', ['212', 'ads point here'], 'acmegoods.com', [['Page', '/pages/black-edition'], ['Ads', '212 live'], ['Since', 'March']]),
						result('box', '/pages/flavor-box', '148 ads point here', ['148', 'ads point here'], 'acmegoods.com', [['Page', '/pages/flavor-box'], ['Ads', '148 live'], ['Since', 'May']]),
						result('quiz', '/quiz', '96 ads point here', ['96', 'ads point here'], 'acmegoods.com', [['Page', '/quiz'], ['Ads', '96 live'], ['Since', 'June']]),
					],
				},
			],
		},
		features: [
			{ headline: 'See where a brand sends its ads', text: 'Every page a brand’s ads link to, ranked by how many ads point there. It counts ads. Traffic and clicks aren’t included.', visual: 'page-record' },
			{ headline: 'Include pages whose ads have stopped', text: 'See the pages behind live ads only, or add the ones whose ads stopped to see what a brand pushed before.', visual: 'pages-switch' },
			{ headline: 'Go from any page to the ads behind it', text: 'Every page links to the brand’s record: its ads, posts and creators. Filter Media search by a page to pull every ad that points to it.', visual: 'links-board' },
		],
		pricing: { value: '1 credit', unit: 'per landing page', rows: [{ name: 'Black edition', meta: 'acmegoods.com' }, { name: 'Flavor box', meta: 'acmegoods.com' }, { name: 'Quiz', meta: 'acmegoods.com' }], free: { name: 'Add a missing brand', meta: 'Indexed automatically' }, tally: '3 landing pages returned' },
		faq: [
			{ q: 'How are the pages ranked?', a: 'By how many of the brand’s ads link to each page, most first. The link on every Meta ad indexed is read, across Facebook and Instagram, and counted per page.' },
			{ q: 'Does the count show traffic or clicks?', a: 'No. It counts the brand’s ads that point to the page, which shows where the brand puts its ads. It is not traffic or click data.' },
			{ q: 'Can I leave out pages that stopped?', a: 'Yes. Ask for active pages only and pages whose ads have all stopped are left out. Include them to see what a brand pushed before.' },
			{ q: 'How many pages come back, and what do they cost?', a: 'Up to 100 pages a call, most ads first. Each page returned costs one credit, so ask for only the top few you need. A failed request is never billed.' },
			{ q: 'Can I see the ads that point to a page?', a: 'Yes. Search the brand’s ads in Media search and filter by the page. You get every ad that links to it, with its hook, format and days run.' },
			{ q: 'Can my agent look up landing pages?', a: 'Yes. Add the MCP server to any MCP client and ask which landing pages are getting the most ads from a brand. Or call the REST API with a key. Both use the same credits.' },
		],
	},
}

// The page's chrome: the header (Products current), the proof row, the pricing actions, the questions' head, the close
// and the footer.
export const productContent = {
	header: { ...siteChrome.header, nav: siteChrome.header.nav.map((l) => (l.href === '/products' ? { ...l, current: true } : l)) },
	primary: { label: 'Get a free API key', href: '/sign-up' },
	docsLabel: 'Read the docs',
	proof: 'Trusted by teams and agents at',
	pricing: { note: '500 free credits every month. No card required.', secondary: { label: 'See pricing', href: '/pricing' } },
	faq: { title: 'Frequently asked questions', lead: 'Every filter, field and limit is in the docs.' },
	close: siteChrome.close,
	footer: siteChrome.footer,
	product: productPages['creator-search'],
}

export type ProductContent = typeof productContent

/** The product page's sections in order; pass `sections` to reorder them or leave some out. */
export const productSections = ['hero', 'proof', 'features', 'compare', 'pricing', 'faq', 'close'] as const
export type ProductSection = (typeof productSections)[number]
