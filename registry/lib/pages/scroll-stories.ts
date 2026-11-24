import { storyFromShape, type ScrollStoryData, type StoryAction, type StoryImage, type StoryLogo } from '@/lib/scroll-story'

// The scroll stories' copy, Acme only: one story for each focal piece the site's five-chapter shape uses (a board, a
// thread of comments, a landing page, a brand's profile). Creatives are neutral placeholders named by advertiser and
// headline; pass `src` for real images.

const ACME: StoryLogo = { name: 'Acme' }
const NORTHWIND: StoryLogo = { name: 'Northwind' }

const ad = (brand: string, caption: string, tone: 1 | 2 | 3 | 4 = 2): StoryImage => ({ brand, caption, tone, alt: `${brand} ad: ${caption}` })
const brands = (n: number) => `${n} brands`
const days = (n: number) => `${n} days`

export const researchStory: ScrollStoryData = storyFromShape({
	id: 'creative-research',
	title: 'How a creative team reads hooks across a category',
	words: [
		{ heading: 'A whole category’s ads', text: 'Pick a category and get every Meta ad from its 16 daily nutrition brands at once.' },
		{ heading: 'Grouped by hook', text: 'Ads gather under the hook they open with. The hook most brands use rises to the top.' },
		{ heading: 'Take one hook apart', text: 'It opens on a question. 16 brands make the same move, and Acme has kept its version live 63 days.' },
		{ heading: 'Same hook, other brands', text: 'Search the hook in plain words and see it in other brands’ ads and posts, each in its own style.' },
		{ heading: 'Watch a hook rise or fade', text: 'A daily trend tracker shows which hooks gain brands, and which brands drop them.' },
	],
	board: { title: 'Daily nutrition', meta: 'Meta ads from 16 brands, last 30 days', logos: [ACME, NORTHWIND], more: 14, action: 'Save' },
	hero: { image: ad('Acme', 'Does it actually work?', 3), badge: brands(16) },
	ranked: [
		{ id: 'hook-welcome-kit', image: ad('Acme', 'Free welcome kit', 4), badge: brands(12) },
		{ id: 'hook-billboard', image: ad('Northwind', 'This is a meal', 2), badge: brands(9) },
		{ id: 'hook-customer-quote', image: ad('Acme', 'Lost 80lbs so far', 1), badge: brands(8) },
		{ id: 'hook-ingredients', image: ad('Northwind', '75 ingredients', 3), badge: brands(6) },
		{ id: 'hook-big-sale', image: ad('Acme', 'Up to 60% off', 2), badge: brands(5) },
	],
	chips: [
		{ label: 'Hook', value: 'A question headline' },
		{ label: 'Used by', value: '16 brands' },
		{ label: 'Kept longest', value: 'Acme, 63 days' },
		{ label: 'First seen', value: 'Aug 12' },
		{ label: 'Format', value: 'Single image' },
	],
	focal: { kind: 'board', title: '“a question as the headline”', meta: 'Daily nutrition, 212 ads and 47 posts' },
	around: [ad('Northwind', 'Tired by noon?', 4), ad('Acme', 'Is it healthy?', 2), ad('Acme', 'What is it?', 1), ad('Northwind', 'Why fiber?', 3)],
	result: {
		title: 'Build your own trend tracker',
		meta: 'Every day at 7:00. Question headlines, by days kept.',
		rows: [
			{ title: 'Does it actually work?', detail: 'Acme', figure: days(63), logo: ACME },
			{ title: 'Tired by noon?', detail: 'Northwind', figure: days(41), logo: NORTHWIND },
			{ title: 'Is it healthy?', detail: 'Acme', figure: days(34), logo: ACME },
			{ title: 'What is it?', detail: 'Acme', figure: days(12), logo: ACME },
		],
	},
})

const asks = (n: string) => `${n} asks`
const post = (caption: string, tone: 1 | 2 | 3 | 4 = 2): StoryImage => ({ brand: 'Acme', caption, tone, alt: `Acme post: ${caption}` })

export const sentimentStory: ScrollStoryData = storyFromShape({
	id: 'consumer-sentiment',
	title: 'How a brand team reads its comments',
	words: [
		{ heading: 'Every post, every comment', text: 'Acme’s Instagram and TikTok posts, each one with its views and the whole thread under it.' },
		{ heading: 'Where people ask the most', text: 'Rank posts by the questions in their comments. A teaser for a new flavor drew the most.' },
		{ heading: 'What the thread is about', text: 'Thousands of comments, read for you: what people ask, what they guess and how warm they are.' },
		{ heading: 'The conversation, word for word', text: 'Who said it and how many agreed, with asks, guesses and complaints on their own tabs.' },
		{ heading: 'Know when the talk shifts', text: 'Each day, count which themes grow in your comments and in your competitors’, with the posts behind them.' },
	],
	board: { title: 'Acme', meta: '@acme on Instagram, 48K comments this month', logo: ACME, action: 'Follow' },
	hero: { image: post('Something saucy is coming', 4), badge: asks('1,168') },
	ranked: [
		{ id: 'post-sherbet', image: post('Sherbet is back', 3), badge: asks('742') },
		{ id: 'post-snow', image: post('Snow day flavors', 1), badge: asks('516') },
		{ id: 'post-giveaway', image: post('Giveaway', 2), badge: asks('388') },
		{ id: 'post-ranch', image: post('Ranch, really?', 4), badge: asks('204') },
		{ id: 'post-arch', image: post('Six packs', 3), badge: asks('96') },
	],
	chips: [
		{ label: 'Comments', value: '2,431' },
		{ label: 'Top ask', value: 'When does it drop?' },
		{ label: 'Top guess', value: 'A hot sauce collab' },
		{ label: 'Mood', value: '78% warm' },
		{ label: 'Asked again', value: 'Bigger packs' },
	],
	focal: {
		kind: 'thread',
		title: '2,431 comments',
		meta: 'Asks 48%, guesses 33%, complaints 7%',
		tabs: ['Asks', 'Guesses', 'Complaints', 'Love'],
		rows: [
			{ who: 'maya.eats', text: 'Is it a sauce or a soda??', likes: '512 likes' },
			{ who: 'jordan_k', text: 'When can I buy it in Chicago?', likes: '344 likes' },
			{ who: 'sam.sips', text: 'Please sell it in 12-packs', likes: '98 likes' },
		],
	},
	around: [post('Tag a teacher', 2), post('Behind the bar', 1), post('The stack', 3), post('Woe is me', 4)],
	result: {
		title: 'Build your own trend tracker',
		meta: 'Every day at 7:00. Themes gaining ground in the comments.',
		logo: ACME,
		rows: [
			{ title: 'When does it drop?', detail: 'Teasers, 1,168 asks', figure: '+41%' },
			{ title: 'Tagging their teachers', detail: 'Friends tagging friends', figure: '+26%' },
			{ title: 'Mocktail recipes', detail: 'Asks for the recipe', figure: '+14%' },
			{ title: 'Bigger packs', detail: 'Asked under 31 posts', figure: '+9%' },
		],
	},
})

const page = (caption: string, tone: 1 | 2 | 3 | 4 = 2): StoryImage => ({ brand: 'Acme', caption, tone, alt: `Acme product page: ${caption}`, position: '50% 0%' })
const ads = (n: number) => `${n} ads`

export const landingStory: ScrollStoryData = storyFromShape({
	id: 'landing-page-development',
	title: 'How a growth team studies the pages behind ads',
	words: [
		{ heading: 'The pages behind the ads', text: 'Ask which product pages get the most Meta ads and see each one as a shopper does, above the fold.' },
		{ heading: 'Ranked by ads pointing there', text: 'A page with 519 ads behind it is a page the brand trusts. That one is Acme’s Black Edition.' },
		{ heading: 'Read the page itself', text: 'Its offer, its headline and what sits above the fold, as Spyglass captured it.' },
		{ heading: 'A second page, same product', text: 'Acme sends its new ads to a page of their own. Open it, and the ads that lead there.' },
		{ heading: 'Hear about new pages first', text: 'When a brand starts sending ads to a new page, you hear that week, with the first ads that lead there.' },
	],
	board: {
		title: 'Product pages',
		meta: 'Most Meta ads behind them, last 30 days',
		query: 'Which product pages get the most Meta ads?',
		filters: ['Channel: Meta ads', 'Page: Product', 'Last: 30 days'],
	},
	hero: { image: page('Black Edition', 3), badge: ads(519) },
	ranked: [
		{ id: 'page-oven', image: page('Countertop oven', 2), badge: ads(212) },
		{ id: 'page-sos', image: page('Rescue spray', 4), badge: ads(164) },
		{ id: 'page-cooker', image: page('Pressure cooker', 1), badge: ads(118) },
		{ id: 'page-shineon', image: page('Lip jelly', 3), badge: ads(87) },
		{ id: 'page-titanium', image: page('Pro pan set', 2), badge: ads(52) },
	],
	chips: [
		{ label: 'Ads behind it', value: '519' },
		{ label: 'Offer', value: 'Free shaker and tee' },
		{ label: 'Headline', value: 'High-protein, high in fiber' },
		{ label: 'Above the fold', value: 'Price and Add to cart' },
		{ label: 'Other pages', value: '5 more from Acme' },
	],
	focal: { kind: 'page', image: { brand: 'Acme', caption: 'Three reasons people love it', tone: 3, alt: 'Acme’s new product page' }, url: 'acme.com/black-edition', meta: '35 ads point here' },
	around: [ad('Acme', 'Not your appetite', 4), ad('Acme', 'You know what’s wild?', 2), ad('Acme', 'Pouch to camera', 1), ad('Acme', '40g protein', 3)],
	result: {
		title: 'Build your own competitor monitor',
		meta: 'Every Monday at 8:00. New pages and the ads behind them.',
		logo: ACME,
		rows: [
			{ title: 'Black Edition', detail: 'acme.com, 519 ads', figure: '+38' },
			{ title: 'Not your appetite', detail: 'To the new page', figure: 'New' },
			{ title: 'You know what’s wild?', detail: 'To the new page', figure: 'New' },
			{ title: 'Pouch to camera', detail: 'To the new page', figure: 'New' },
		],
	},
})

const pic = (caption: string, tone: 1 | 2 | 3 | 4 = 2): StoryImage => ({ brand: 'Acme', caption, tone, alt: `Acme: ${caption}` })

export const channelsStory: ScrollStoryData = storyFromShape({
	id: '360-degree-research',
	title: 'How a strategist reads one brand across every channel',
	words: [
		{ heading: 'Acme, on every channel', text: 'One name pulls up its Meta ads, its Instagram and TikTok posts and what creators post about it.' },
		{ heading: 'Each channel by its own measure', text: 'Ads by days run, posts and creator posts by views. Each channel’s best in one view.' },
		{ heading: 'One record holds it all', text: 'Ads, posts, creators, landing pages and comments, linked to the same brand. Nothing counted twice.' },
		{ heading: 'Open the brand’s record', text: 'Its profile and latest work, with every ad, post, creator and page tied to it a click away.' },
		{ heading: 'One brand’s week, every channel', text: 'Once a week, what the brand did on each channel, in one note your team can forward.' },
	],
	board: { title: 'Acme', meta: 'Meta ads, Instagram, TikTok and creators', logo: ACME, action: 'Follow' },
	hero: { image: pic('Lip and cheek', 3), badge: 'Post, 1.4M views' },
	ranked: [
		{ id: 'pic-pearl-hand', image: pic('Meet pocket pearl', 2), badge: 'Post, 1.1M views' },
		{ id: 'pic-lip-shape', image: pic('Lip shape', 4), badge: 'Ad, 88 days' },
		{ id: 'pic-new-from', image: pic('New from Acme', 1), badge: 'Post, 920K views' },
		{ id: 'pic-highlight', image: pic('Highlight milk', 3), badge: 'Creator, 410K views' },
		{ id: 'pic-blush', image: pic('Blush', 2), badge: 'Ad, 34 days' },
	],
	chips: [
		{ label: 'Ads', value: '214 live' },
		{ label: 'Posts', value: '96' },
		{ label: 'Creators', value: '38' },
		{ label: 'Pages', value: '12' },
		{ label: 'Comments', value: '18.2K' },
	],
	focal: {
		kind: 'profile',
		logo: ACME,
		name: 'Acme',
		handle: '@acme',
		meta: 'Skincare and makeup, 214 live Meta ads',
		action: 'Follow',
		posts: [pic('Kit', 2), pic('Lip tint', 3), pic('Glazing milk', 1), pic('Swatches', 4), pic('Pocket blush', 2), pic('Travel', 3)],
		footer: '38 creators and 12 pages on the same record',
	},
	around: [pic('Travel case', 4), pic('The bottle', 2), pic('Tube close-up', 1), pic('Pocket pearls', 3)],
	result: {
		title: 'Build your own competitor monitor',
		meta: 'Every Monday at 8:00. One brand, every channel.',
		logo: ACME,
		rows: [
			{ title: 'Instagram', detail: 'Lip and cheek, 1.4M views', figure: '+22%' },
			{ title: 'Meta ads', detail: '214 live, 18 new this week', figure: '+18' },
			{ title: 'Landing pages', detail: '12 live, 1 new', figure: '+1' },
			{ title: 'Creators', detail: '38 posted, 5 for the first time', figure: '+5' },
		],
	},
})

/** The stories by name, for the `preset` prop and attribute. */
export const scrollStories = { research: researchStory, sentiment: sentimentStory, landing: landingStory, channels: channelsStory }
export type ScrollStoryPreset = keyof typeof scrollStories

/** The buttons under the last chapter on the site's use-case pages. */
export const storyActions: StoryAction[] = [
	{ label: 'Get a free API key', href: '/sign-up' },
	{ label: 'See templates', href: '/templates' },
]
