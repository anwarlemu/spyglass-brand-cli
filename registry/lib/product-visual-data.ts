// The product visuals' data: one shape per family of visual and the defaults (Acme), shared by both flavors. The site's
// own visuals (pages/Products/visuals and v2/V2Features LinksBoard and PatternsSwitch) show real brands, creators and
// their pictures; these defaults keep the copy's shape with Acme and invented people, and leave every picture out, so
// each slot draws a neutral shape. Pass your own pictures (`picture`, `avatar`, `logo`, `src`) where you may show them.

import type { ImageSlot } from '@/lib/image'

export type ProductVisualKind =
	| 'brand-record'
	| 'creative-record'
	| 'page-record'
	| 'creator-record'
	| 'tagged-record'
	| 'comment-thread'
	| 'add-account'
	| 'add-creator'
	| 'comment-themes'
	| 'creator-filters'
	| 'filter-narrow'
	| 'posts-narrow'
	| 'collabs-timeline'
	| 'tagged-timeline'
	| 'media-mix'
	| 'campaigns'
	| 'pages-switch'
	| 'links-board'
	| 'patterns-switch'

export const productVisualKinds: ProductVisualKind[] = ['brand-record', 'creative-record', 'page-record', 'creator-record', 'tagged-record', 'comment-thread', 'add-account', 'add-creator', 'comment-themes', 'creator-filters', 'filter-narrow', 'posts-narrow', 'collabs-timeline', 'tagged-timeline', 'media-mix', 'campaigns', 'pages-switch', 'links-board', 'patterns-switch']

/** A record panel beside a picture, cycling through its sets (brand, creative, page, creator and tagged records). */
export interface RecordSet {
	/** The picture beside the panel (4:5): a src or { src, alt, fit, position }. A neutral shape when left out. */
	picture?: string | ImageSlot
	/** The panel's first line: a brand, a page or a person. */
	name: string
	/** The line under it: a handle, a domain or what the picture is. */
	sub: string
	/** The round mark before the name: an image, or the initial on White when there is none. */
	mark?: { src?: string; initial?: string }
	/** One value per label, in order. */
	values: string[]
}
export interface RecordData {
	labels: string[]
	sets: RecordSet[]
	/** Read by screen readers in place of the panel. */
	summary?: string
}

/** A post with three of its comments (comment-thread). */
export interface ThreadComment {
	handle: string
	likes: string
	text: string
	avatar?: string
}
export interface ThreadData {
	/** The account the posts are from. */
	handle: string
	sets: { picture?: string | ImageSlot; meta: string; comments: ThreadComment[] }[]
	summary?: string
}

/** Adding an account by its handles: added, indexing, ready (add-account, add-creator). */
export interface AddData {
	title: string
	/** The note opposite the title ("Free"). */
	free: string
	/** What was typed: a website, a handle. */
	inputs: string[]
	/** The status steps; the last is where the loop rests. */
	steps: string[]
	account: { name: string; initial: string; avatar?: string; category: string; followers: string }
	summary?: string
}

/** Comments sorted into themes, one theme at a time (comment-themes). */
export interface ThemesData {
	title: string
	themes: { label: string; share: string; comments: { handle: string; text: string; avatar?: string }[] }[]
	summary?: string
}

/** A creator search narrowed by filters (creator-filters). `step` is when a filter turns on (0: never), `out` when a
 * row leaves (0: never). */
export interface FiltersData {
	query: string
	filters: { label: string; value: string; step: number }[]
	rows: { handle: string; initial: string; avatar?: string; city: string; followers: string; out: number }[]
	summary?: string
}

/** A search narrowed by three filters over a grid of eight results (filter-narrow, posts-narrow). A tile dims at
 * step `out` (0: it stays). */
export interface NarrowData {
	query: string
	filters: string[]
	/** The result count at each step: before any filter, then after each. */
	counts: string[]
	tiles: (ImageSlot & { out: number })[]
	summary?: string
}

/** People ranked by posts with a brand, each with their run of posts on a time axis, filtered by window
 * (collabs-timeline, tagged-timeline). Dates are ISO days. */
export interface TimelineData {
	brand: { name: string; mark?: string }
	title: string
	/** Today, so dates in this year drop their year. */
	today: string
	axis: { from: string; to: string; labels: string[] }
	/** The windows; `from` null for all time. The loop rests on the second. */
	windows: { label: string; from: string | null }[]
	rows: { name: string; picture?: string | ImageSlot; first: string; latest: string; posts: string }[]
	summary?: string
}

/** A ranked sheet with a two-way switch: rows move, leave or change values with the view (media-mix, campaigns,
 * pages-switch). `at` is each row's place per view (null: not in that view); `fill` its share bar per view (0 to 1). */
export interface SheetData {
	brand: { name: string; logo?: string; note: string }
	views: string[]
	/** The switch's accessible name. */
	switchLabel: string
	rows: { key: string; picture?: string | ImageSlot; name: string; tag?: string; values: string[]; fill?: number[]; at: (number | null)[]; muted?: boolean }[]
	/** One per view, read by screen readers. */
	summary?: string[]
}

/** A board of a brand's landing page, its ads and two creators, building and clearing scene after scene
 * (links-board). Each scene takes eight tiles after the page. */
export interface BoardScene {
	brand: string
	logo?: string
	page: ImageSlot & { y?: number; domain: string; path: string; ads: string }
	tiles: (ImageSlot & { x?: number; y?: number; zoom?: number })[]
	creators: { handle: string; avatar?: string | ImageSlot }[]
}
export interface BoardData {
	scenes: BoardScene[]
}

/** A brand's top hooks, angles and personas as share bars over three ads, the top ad in focus (patterns-switch).
 * `top` lists the ads (by index) in focus for a view. */
export interface PatternsData {
	brand: string
	logo?: string
	window: string
	ads: (ImageSlot & { x?: number })[]
	views: { label: string; rows: { name: string; share: number }[]; top: number[] }[]
}

export interface ProductVisualDataMap {
	'brand-record': RecordData
	'creative-record': RecordData
	'page-record': RecordData
	'creator-record': RecordData
	'tagged-record': RecordData
	'comment-thread': ThreadData
	'add-account': AddData
	'add-creator': AddData
	'comment-themes': ThemesData
	'creator-filters': FiltersData
	'filter-narrow': NarrowData
	'posts-narrow': NarrowData
	'collabs-timeline': TimelineData
	'tagged-timeline': TimelineData
	'media-mix': SheetData
	campaigns: SheetData
	'pages-switch': SheetData
	'links-board': BoardData
	'patterns-switch': PatternsData
}

const brandRecord: RecordData = {
	labels: ['Category', 'Instagram', 'TikTok'],
	sets: [
		{ name: 'Acme', sub: '@acme', mark: { initial: 'A' }, values: ['Beauty and personal care', '3.1M followers', '1.1M followers'] },
		{ name: 'Acme Studio', sub: '@acmestudio', mark: { initial: 'A' }, values: ['Health and beauty', '1.5M followers', '816K followers'] },
		{ name: 'Acme Goods', sub: '@acmegoods', mark: { initial: 'A' }, values: ['Health and beauty', '1.3M followers', '220K followers'] },
	],
	summary: "Acme (@acme): beauty and personal care, 3.1M followers on Instagram, 1.1M on TikTok. Acme Studio (@acmestudio): health and beauty, 1.5M followers on Instagram, 816K on TikTok. Acme Goods (@acmegoods): health and beauty, 1.3M followers on Instagram, 220K on TikTok.",
}

const creativeRecord: RecordData = {
	labels: ['Hook', 'Angle', 'For'],
	sets: [
		{ name: 'Acme', sub: 'Meta ad, ran 74 days', values: ['Support for the long run', 'Supportive cushioning', 'Daily road runners'] },
		{ name: 'Acme Run', sub: 'Meta ad, ran 72 days', values: ['Introducing the Veil', 'A new shoe, shown whole', 'Style-led runners'] },
		{ name: 'Acme Trail', sub: 'Meta ad, running 63 days', values: ['One shoe, road to trail', 'Made for travel', 'Light packers'] },
	],
	summary: 'Acme, Meta ad, ran 74 days: hook "Support for the long run", angle supportive cushioning, for daily road runners. Acme Run, Meta ad, ran 72 days: hook "Introducing the Veil", angle a new shoe, shown whole, for style-led runners. Acme Trail, Meta ad, running 63 days: hook "One shoe, road to trail", angle made for travel, for light packers.',
}

const pageRecord: RecordData = {
	labels: ['Path', 'Ads pointing here', 'Rank'],
	sets: [
		{ name: 'Daily shake', sub: 'acme.com', mark: { initial: 'A' }, values: ['/products/daily-shake', '519', '1 of 6'] },
		{ name: 'Daily shake for runners', sub: 'try.acme.com', mark: { initial: 'A' }, values: ['/us/daily-shake-run', '35', '2 of 6'] },
		{ name: 'Ready-to-drink', sub: 'acme.com', mark: { initial: 'A' }, values: ['/products/daily-shake-ready-to-drink', '25', '3 of 6'] },
	],
	summary: "Acme's landing pages, most ads first: acme.com/products/daily-shake, 519 ads; try.acme.com/us/daily-shake-run, 35 ads; acme.com/products/daily-shake-ready-to-drink, 25 ads. The count is ads that point to the page.",
}

const creatorRecord: RecordData = {
	labels: ['Instagram', 'Location', 'Focus', 'Age'],
	sets: [
		{ name: 'Avery Cole', sub: '@averycole', mark: { initial: 'A' }, values: ['367K followers', 'Austin, Texas', 'Functional training', '25 to 34'] },
		{ name: 'Nora Bell', sub: '@norabell', mark: { initial: 'N' }, values: ['457K followers', 'Austin, Texas', 'Beginner strength', '25 to 34'] },
		{ name: 'Jun Park', sub: '@junpark.lifts', mark: { initial: 'J' }, values: ['194K followers', 'Amarillo, Texas', 'Home-gym workouts', '25 to 34'] },
	],
	summary: 'Avery Cole (@averycole): 367K followers on Instagram, based in Austin, Texas, posting about functional training, aged 25 to 34. Nora Bell (@norabell): 457K followers, Austin, Texas, beginner strength, 25 to 34. Jun Park (@junpark.lifts): 194K followers, Amarillo, Texas, home-gym workouts, 25 to 34.',
}

const taggedRecord: RecordData = {
	labels: ['Tagged', 'Posted', 'Likes', 'Followers'],
	sets: [
		{ name: 'Mia Torres', sub: '@miacooks', mark: { initial: 'M' }, values: ['@acme', '12 Nov', '4,812', '86K'] },
		{ name: 'Leo Grant', sub: '@leogrant', mark: { initial: 'L' }, values: ['@acme', '8 Nov', '967', '12K'] },
		{ name: 'Ines Moreau', sub: '@inesbakes', mark: { initial: 'I' }, values: ['@acme', '4 Nov', '2,140', '31K'] },
	],
	summary: 'Mia Torres (@miacooks) tagged @acme in an Instagram post on 12 Nov: 4,812 likes, 86K followers. Leo Grant (@leogrant) on 8 Nov: 967 likes, 12K followers. Ines Moreau (@inesbakes) on 4 Nov: 2,140 likes, 31K followers.',
}

const commentThread: ThreadData = {
	handle: '@acme',
	sets: [
		{ meta: 'Instagram post, 1,204 comments', comments: [
			{ handle: 'maya.bakes', likes: '312 likes', text: 'Restock the white set please' },
			{ handle: 'jordan_eats', likes: '148 likes', text: 'Need this for the club' },
			{ handle: 'sipsbysam', likes: '96 likes', text: 'Is it the same fleece as the sweats?' },
		] },
		{ meta: 'Instagram post, 2,860 comments', comments: [
			{ handle: 'lena.k', likes: '540 likes', text: 'The colors, the fit, all of it' },
			{ handle: 'drinkswithdev', likes: '221 likes', text: 'Restock the ringer tee' },
			{ handle: 'tom.runs', likes: '87 likes', text: 'What size is the tee?' },
		] },
		{ meta: 'Instagram post, 936 comments', comments: [
			{ handle: 'ari.snacks', likes: '264 likes', text: 'Does this ship to Canada?' },
			{ handle: 'kchen', likes: '119 likes', text: 'Need it in green' },
			{ handle: 'noor.m', likes: '72 likes', text: 'Is the vest wool?' },
		] },
	],
	summary: '@acme, Instagram post, 1,204 comments: maya.bakes, "Restock the white set please" (312 likes); jordan_eats, "Need this for the club" (148 likes); sipsbysam, "Is it the same fleece as the sweats?" (96 likes). Two more posts follow, with their top comments.',
}

const addAccount: AddData = {
	title: 'Add an account',
	free: 'Free',
	inputs: ['acme.com', '@acme'],
	steps: ['Added', 'Indexing', 'Ready'],
	account: { name: 'Acme', initial: 'A', category: 'Skincare', followers: '48K on Instagram' },
	summary: 'A brand missing from the index is added by its website and Instagram handle. Its status goes from added to indexing to ready, and then it can be searched like any other brand.',
}

const addCreator: AddData = {
	...addAccount,
	inputs: ['@rosa.runs'],
	account: { name: 'Rosa Vidal', initial: 'R', category: 'Running', followers: '41K on Instagram' },
	summary: 'A creator missing from the index is added by their Instagram handle. Their status goes from added to indexing to ready, and then they can be searched like any other creator.',
}

const commentThemes: ThemesData = {
	title: '@acme, last 20 posts',
	themes: [
		{ label: 'Questions', share: '66% of comments', comments: [
			{ handle: 'maya.bakes', text: 'Recipe please!' },
			{ handle: 'ari.snacks', text: 'Where do I find these?' },
			{ handle: 'jules.p', text: 'Does it work without the syrup?' },
		] },
		{ label: 'Tags', share: '24% of comments', comments: [
			{ handle: 'lena.k', text: 'You in for Friday?' },
			{ handle: 'max.w', text: 'Making this for us this weekend' },
			{ handle: 'rio.d', text: 'This is so you' },
		] },
		{ label: 'Praise', share: '10% of comments', comments: [
			{ handle: 'priya.eats', text: 'Pomegranate is the best one' },
			{ handle: 'kchen', text: 'Ginger forever' },
			{ handle: 'drinkswithdev', text: 'Best soda in the fridge' },
		] },
	],
	summary: "The comments under Acme's last 20 posts, sorted into questions, 66 percent, such as asking for the recipe or where to buy; tags of friends, 24 percent; and praise for the flavors, 10 percent.",
}

const creatorFilters: FiltersData = {
	query: 'Fitness creators',
	filters: [
		{ label: 'Location', value: 'Texas', step: 1 },
		{ label: 'Followers', value: '50K to 500K', step: 1 },
		{ label: 'Language', value: 'English', step: 2 },
		{ label: 'Age', value: '25 to 34', step: 2 },
		{ label: 'Gender', value: 'Any', step: 0 },
	],
	rows: [
		{ handle: '@averycole', initial: 'A', city: 'Austin, Texas', followers: '367K', out: 0 },
		{ handle: '@camilleross', initial: 'C', city: 'Denver, Colorado', followers: '507K', out: 1 },
		{ handle: '@norabell', initial: 'N', city: 'Austin, Texas', followers: '457K', out: 0 },
		{ handle: '@hollisfit', initial: 'H', city: 'Houston, Texas', followers: '62.1K', out: 2 },
		{ handle: '@junpark.lifts', initial: 'J', city: 'Amarillo, Texas', followers: '194K', out: 0 },
	],
	summary: 'A search for fitness creators, narrowed by location, follower range, language and age range, goes from five creators to the three in Texas with 50K to 500K followers.',
}

const filterNarrow: NarrowData = {
	query: 'Product shots on a pale ground',
	filters: ['Meta ads', 'Product aware', 'Ran 30+ days'],
	counts: ['2,418 results', '1,306 results', '412 results', '88 results'],
	tiles: [{ out: 0 }, { out: 1 }, { out: 3 }, { out: 2 }, { out: 1 }, { out: 0 }, { out: 2 }, { out: 0 }],
	summary: 'A search for product shots on a pale ground returns ads and posts. Three filters, Meta ads, product aware and ran 30 days or more, narrow eight of them to three Acme ads.',
}

const postsNarrow: NarrowData = {
	query: 'Fall drinks',
	filters: ['Soft drinks', 'Last 30 days', 'Top outliers'],
	counts: ['3,912 posts', '860 posts', '214 posts', '12 posts'],
	tiles: [{ out: 0 }, { out: 1 }, { out: 2 }, { out: 0 }, { out: 1 }, { out: 3 }, { out: 1 }, { out: 0 }],
	summary: 'A search for fall drinks on Instagram and TikTok, narrowed to soft drinks, the last 30 days and the top outliers, leaves three Acme posts worth reading the comments under.',
}

const collabsTimeline: TimelineData = {
	brand: { name: 'Acme' },
	title: 'Creators',
	today: '2026-11-19',
	axis: { from: '2025-06-01', to: '2026-11-30', labels: ['Jun 2025', 'Nov 2026'] },
	windows: [{ label: 'All time', from: null }, { label: 'This year', from: '2026-01-01' }, { label: 'Last 90 days', from: '2026-08-21' }],
	rows: [
		{ name: 'Lena Ortega', first: '2026-01-14', latest: '2026-11-09', posts: '12 posts' },
		{ name: 'Rosa Lindgren', first: '2025-06-14', latest: '2026-02-20', posts: '9 posts' },
		{ name: 'Marcus Hale', first: '2026-02-02', latest: '2026-11-01', posts: '7 posts' },
		{ name: 'June Abara', first: '2026-03-21', latest: '2026-10-28', posts: '5 posts' },
		{ name: 'Ade Morgan', first: '2026-09-12', latest: '2026-10-17', posts: '3 posts' },
	],
	summary: "Acme's creators, most posts together first, each with their first and latest post. Over all time there are five; this year four, led by Lena Ortega with 12 posts since 14 January; in the last 90 days one, Ade Morgan.",
}

const taggedTimeline: TimelineData = {
	...collabsTimeline,
	title: 'Tagged by',
	today: '2026-11-20',
	rows: [
		{ name: 'Northside Run Club', first: '2026-01-08', latest: '2026-11-14', posts: '16 posts' },
		{ name: 'Ava Lind', first: '2025-07-02', latest: '2026-11-02', posts: '10 posts' },
		{ name: 'Mila Hartley', first: '2026-04-11', latest: '2026-11-11', posts: '6 posts' },
		{ name: 'Cold Miles Club', first: '2026-02-19', latest: '2026-10-29', posts: '4 posts' },
		{ name: 'Jonas Kerr', first: '2026-09-30', latest: '2026-11-06', posts: '2 posts' },
	],
	summary: 'The people who tag Acme on Instagram, most posts first, each with their first and latest tagged post. Over all time there are five; this year four, led by Northside Run Club with 16 posts since 8 January; in the last 90 days one, Jonas Kerr.',
}

const pct = (n: number) => `${n}%`
const mediaMix: SheetData = {
	brand: { name: 'Acme', note: 'Ads by format' },
	views: ['30 days', '90 days'],
	switchLabel: 'How far back to look',
	rows: [
		{ key: 'video', name: 'Video', values: [pct(51), pct(43)], fill: [0.51, 0.43], at: [0, 0] },
		{ key: 'image', name: 'Image', values: [pct(29), pct(35)], fill: [0.29, 0.35], at: [1, 1] },
		{ key: 'carousel', name: 'Carousel', values: [pct(13), pct(14)], fill: [0.13, 0.14], at: [2, 2] },
		{ key: 'catalog', name: 'Catalog', values: [pct(7), pct(8)], fill: [0.07, 0.08], at: [3, 3] },
	],
	summary: ["Acme's ads by format over the last 30 days: video 51%, image 29%, carousel 13%, catalog 7%.", "Acme's ads by format over the last 90 days: video 43%, image 35%, carousel 14%, catalog 8%."],
}

const campaigns: SheetData = {
	brand: { name: 'Acme', note: 'Campaigns and offers' },
	views: ['Newest', 'Fastest'],
	switchLabel: 'Sort by',
	rows: [
		{ key: 'flavors', name: 'Every flavor in one box', tag: 'Offer', values: ['Started 14 Nov', '6 new ads'], at: [0, 3] },
		{ key: 'value', name: 'Under $4 a meal', tag: 'Offer', values: ['Started 10 Nov', '9 new ads'], at: [1, 2] },
		{ key: 'runners', name: 'The daily shake for runners', tag: 'Campaign', values: ['Started 3 Nov', '24 new ads'], at: [2, 0] },
		{ key: 'parents', name: 'Protein for busy parents', tag: 'Campaign', values: ['Started 28 Oct', '15 new ads'], at: [3, 1] },
	],
	summary: ["Acme's campaigns and offers, newest first: Every flavor in one box, started 14 Nov; Under $4 a meal, 10 Nov; The daily shake for runners, 3 Nov; Protein for busy parents, 28 Oct.", "Acme's campaigns and offers, fastest first, by new ads in the last 7 days: The daily shake for runners, 24; Protein for busy parents, 15; Under $4 a meal, 9; Every flavor in one box, 6."],
}

const TOP = 519
const pagesSwitch: SheetData = {
	brand: { name: 'Acme', note: 'Most ads first' },
	views: ['Active', 'All'],
	switchLabel: 'Which pages',
	rows: [
		{ key: 'daily', name: '/products/daily-shake', values: ['519 ads', '519 ads'], fill: [1, 1], at: [0, 0] },
		{ key: 'bars', name: '/products/protein-bars', tag: 'Stopped', values: ['48 ads', '48 ads'], fill: [48 / TOP, 48 / TOP], at: [null, 1], muted: true },
		{ key: 'run', name: '/us/daily-shake-run', values: ['35 ads', '35 ads'], fill: [35 / TOP, 35 / TOP], at: [1, 2] },
		{ key: 'rtd', name: '/products/daily-shake-ready-to-drink', values: ['25 ads', '25 ads'], fill: [25 / TOP, 25 / TOP], at: [2, 3] },
	],
	summary: ["Acme's active landing pages, most ads first: daily-shake, 519 ads; daily-shake-run, 35; daily-shake-ready-to-drink, 25.", "All of Acme's landing pages, including those whose ads have stopped: daily-shake, 519 ads; protein-bars, stopped, 48; daily-shake-run, 35; daily-shake-ready-to-drink, 25."],
}

const blank = (n: number) => Array.from({ length: n }, () => ({}))
const linksBoard: BoardData = {
	scenes: [
		{ brand: 'Acme', page: { domain: 'acme.com', path: '/products/daily-shake', ads: '14 ads point here' }, tiles: blank(8), creators: [{ handle: '@mattmeals' }, { handle: '@dan.fuels' }] },
		{ brand: 'Acme Studio', page: { domain: 'acmestudio.com', path: '/products/pocket-blush', ads: '9 ads point here' }, tiles: blank(8), creators: [{ handle: '@nina.glow' }, { handle: '@beautybyjo' }] },
		{ brand: 'Acme Soda', page: { domain: 'acmesoda.com', path: '/pages/fall-collab', ads: '22 ads point here' }, tiles: blank(8), creators: [{ handle: '@leogrant' }, { handle: '@miacooks' }] },
	],
}

const patternsSwitch: PatternsData = {
	brand: 'Acme',
	window: 'Last 90 days',
	ads: [{ x: 0 }, { x: 50 }, { x: 50 }],
	views: [
		{ label: 'Hooks', rows: [{ name: 'Does it actually work?', share: 29 }, { name: 'One scoop, not a shelf of pills', share: 24 }, { name: 'Built for training days', share: 21 }], top: [0] },
		{ label: 'Angles', rows: [{ name: 'Simplify your daily routine', share: 34 }, { name: 'Fuel for training', share: 27 }, { name: 'Tested to a higher standard', share: 22 }], top: [1] },
		{ label: 'Personas', rows: [{ name: 'Gym-goers', share: 33 }, { name: 'Busy professionals', share: 26 }, { name: 'Wellness skeptics', share: 23 }], top: [2] },
	],
}

/** Each kind's default data (Acme). */
export const productVisualDefaults: ProductVisualDataMap = {
	'brand-record': brandRecord,
	'creative-record': creativeRecord,
	'page-record': pageRecord,
	'creator-record': creatorRecord,
	'tagged-record': taggedRecord,
	'comment-thread': commentThread,
	'add-account': addAccount,
	'add-creator': addCreator,
	'comment-themes': commentThemes,
	'creator-filters': creatorFilters,
	'filter-narrow': filterNarrow,
	'posts-narrow': postsNarrow,
	'collabs-timeline': collabsTimeline,
	'tagged-timeline': taggedTimeline,
	'media-mix': mediaMix,
	campaigns,
	'pages-switch': pagesSwitch,
	'links-board': linksBoard,
	'patterns-switch': patternsSwitch,
}
