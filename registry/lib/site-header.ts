// The site header's content and glyphs (site/Header, content/nav.ts, content/home.ts): the nav, the three menus and the
// menu icons, the same in both flavors. Copy is Acme's; platforms are named in words (never their logos); pictures come
// in through `picture` and `shots` (none by default, so no one's photo is shown unless you pass it).

export type NavIconName =
	| 'brand' | 'creator' | 'media' | 'insights' | 'landing' | 'collabs' | 'comments' | 'tagged' | 'soon' | 'paid' | 'organic'
	| 'creators' | 'monitor' | 'trend' | 'build' | 'research' | 'templates' | 'docs' | 'blog' | 'articles' | 'demos' | 'careers'

export type MenuKey = 'products' | 'useCases' | 'resources'

export interface NavEntry {
	label: string
	/** A plain link. */
	href?: string
	/** Opens this menu instead (from 1280; a disclosure in the phone sheet, resources a link to `resources.all`). */
	menu?: MenuKey
	/** The page being shown. */
	current?: boolean
}

export interface MenuLink { label: string; href: string }

export interface OfferRow {
	key: string
	name: string
	line: string
	href: string
	icon: NavIconName
	/** Where it is live, in words: a chip on the live card. */
	platforms?: string[]
	/** A picture for the live card (a product shot, never a person's photo by default). */
	picture?: string
}

export interface SoonRow {
	key: string
	name: string
	line: string
	href: string
	icon: NavIconName
	/** The live card's groups: a label over the platforms or integrations, in words. */
	groups: { label: string; items: string[] }[]
}

export interface ProductsMenu { offers: OfferRow[]; soon?: SoonRow; strip: { label: string; links: MenuLink[] } }

export interface CaseRow {
	key: string
	name: string
	line: string
	href: string
	icon: NavIconName
	/** The card's longer line. */
	card?: string
	/** Up to three pictures for the card (4:5); empty tiles when left out. */
	shots?: string[]
}

export interface UseCasesMenu { rows: CaseRow[]; all: MenuLink; more: MenuLink[] }

export interface ResourceRow { key: string; title: string; href: string; icon: NavIconName; soon?: boolean; external?: boolean }

export interface ResourcesMenu {
	rows: ResourceRow[]
	all: MenuLink
	feature: { title: string; line: string; href: string; code: string; external?: boolean }
	soonLabel: string
}

export interface HeaderMenus { products?: ProductsMenu; useCases?: UseCasesMenu; resources?: ResourcesMenu }

export interface HeaderLabels { nav: string; menu: string; close: string; home: string }

export const headerNav: NavEntry[] = [
	{ label: 'Products', menu: 'products' },
	{ label: 'Use cases', menu: 'useCases' },
	{ label: 'Enterprise', href: '#enterprise' },
	{ label: 'Resources', menu: 'resources' },
	{ label: 'Pricing', href: '#pricing' },
]

export const headerLabels: HeaderLabels = { nav: 'Main', menu: 'Menu', close: 'Close menu', home: 'Home' }

export const headerMenus: Required<HeaderMenus> = {
	products: {
		offers: [
			{ key: 'brands-creators', name: 'Brands and creators', platforms: ['Meta', 'Instagram', 'TikTok'], line: 'Profiles, handles, reach and category', icon: 'brand', href: '#brands' },
			{ key: 'media-archive', name: 'Media archive', platforms: ['Meta', 'Instagram', 'TikTok'], line: 'Ads, posts, performance, comments', icon: 'media', href: '#media' },
			{ key: 'collaborations', name: 'Collaborations', platforms: ['Meta', 'Instagram'], line: 'Who works with whom, since when', icon: 'collabs', href: '#collabs' },
			{ key: 'creative-insights', name: 'Creative insights', line: 'Hooks, angles, personas and formats', icon: 'insights', href: '#insights' },
			{ key: 'search', name: 'Realtime search', line: 'Ask in plain words, across it all', icon: 'research', href: '#search' },
		],
		soon: {
			key: 'coming-soon',
			name: 'Coming soon',
			line: 'New platforms on the way',
			icon: 'soon',
			href: '#soon',
			groups: [
				{ label: 'Ad libraries and social channels', items: ['Google Ads', 'LinkedIn', 'Pinterest', 'YouTube', 'X'] },
				{ label: 'Direct integrations', items: ['Meta', 'Acme Analytics', 'Acme Attribution'] },
			],
		},
		strip: { label: 'Build with', links: [{ label: 'API reference', href: '#api' }, { label: 'SDKs', href: '#sdks' }, { label: 'CLI', href: '#cli' }, { label: 'MCP', href: '#mcp' }] },
	},
	useCases: {
		rows: [
			{ key: 'build', name: 'Build your own', line: 'Agents, ad libraries and more', icon: 'build', href: '#build', card: 'Your own agents, ad libraries and tools, built on the Acme API and MCP server.' },
			{ key: 'research', name: 'Creative research', line: 'Hooks, angles and formats that win', icon: 'research', href: '#research' },
			{ key: 'paid', name: 'Paid ads', line: 'What brands run, and how long', icon: 'paid', href: '#paid' },
			{ key: 'organic', name: 'Organic social', line: 'Posts and how they perform', icon: 'organic', href: '#organic' },
			{ key: 'competitive', name: 'Competitive analysis', line: 'What competitors launch and test', icon: 'monitor', href: '#competitive' },
			{ key: 'creators', name: 'Creator sourcing', line: 'Find creators and their collabs', icon: 'creators', href: '#creators' },
		],
		all: { label: 'All use cases', href: '#use-cases' },
		more: [{ label: 'Consumer sentiment', href: '#sentiment' }, { label: 'Landing page development', href: '#landing' }, { label: '360-degree research', href: '#research-360' }],
	},
	resources: {
		rows: [
			{ key: 'templates', title: 'Templates', href: '#templates', icon: 'templates' },
			{ key: 'case-studies', title: 'Case studies', href: '#case-studies', icon: 'insights' },
			{ key: 'blog', title: 'Blog', href: '#blog', icon: 'blog' },
			{ key: 'articles', title: 'Articles', href: '#articles', icon: 'articles' },
			{ key: 'demos', title: 'Demos', href: '#demos', icon: 'demos', soon: true },
		],
		all: { label: 'All resources', href: '#resources' },
		feature: { title: 'Docs', line: 'Set up the MCP server, call the REST API and use the SDKs.', href: '#docs', code: 'npm install -g @acme/cli' },
		soonLabel: 'Coming soon',
	},
}

// ----- The menu glyphs (site NavIcon): two tones on a 24px grid, a body in the gray and a lit part in the soft gray
// (White when the row is active), cut out of the ground. -----
type Tone = 'body' | 'lit' | 'cut' | 'hole'
type Part = { d: string; tone: Tone; line?: boolean; w?: number; t?: string }

const r = (x: number, y: number, w: number, h: number, k = 1) =>
	k === 0
		? `M${x} ${y}h${w}v${h}h-${w}Z`
		: `M${x + k} ${y}h${w - 2 * k}a${k} ${k} 0 0 1 ${k} ${k}v${h - 2 * k}a${k} ${k} 0 0 1-${k} ${k}h-${w - 2 * k}a${k} ${k} 0 0 1-${k}-${k}v-${h - 2 * k}a${k} ${k} 0 0 1 ${k}-${k}Z`
const circle = (cx: number, cy: number, rad: number) => `M${cx - rad} ${cy}a${rad} ${rad} 0 1 0 ${2 * rad} 0a${rad} ${rad} 0 1 0-${2 * rad} 0Z`
const front = (d: string, t?: string): Part[] => [{ d, tone: 'cut', line: true, t }, { d, tone: 'lit', t }]
const TAG = 'M2.5 11.4V4a1.5 1.5 0 0 1 1.5-1.5h7.4a1.5 1.5 0 0 1 1.06.44l8.66 8.66a1.5 1.5 0 0 1 0 2.12l-7.4 7.4a1.5 1.5 0 0 1-2.12 0L2.94 12.46a1.5 1.5 0 0 1-.44-1.06Z'
const play = (x: number, y: number, k = 1) => {
	const n = (v: number) => +(v * k).toFixed(3)
	return `M${+(x - n(2.4)).toFixed(3)} ${+(y - n(3.3)).toFixed(3)}v${n(6.6)}a${n(0.6)} ${n(0.6)} 0 0 0 ${n(0.92)} ${n(0.5)}l${n(5.1)} ${-n(3.3)}a${n(0.6)} ${n(0.6)} 0 0 0 0 ${-n(1)}l${-n(5.1)} ${-n(3.3)}a${n(0.6)} ${n(0.6)} 0 0 0 ${-n(0.92)} ${n(0.5)}Z`
}
const shoulders = (x: number, top: number, half: number, bottom: number) => `M${x - half} ${bottom}c0-${(bottom - top) * 0.9} ${half * 0.55}-${bottom - top} ${half}-${bottom - top}s${half} ${(bottom - top) * 0.1} ${half} ${bottom - top}Z`

const ICONS: Record<NavIconName, Part[]> = {
	brand: [{ d: TAG, tone: 'body', t: 'translate(.5 .5) scale(.8)' }, ...front(TAG, 'translate(4.3 4.3) scale(.8)'), { d: circle(7.5, 7.5, 2), tone: 'hole', t: 'translate(4.3 4.3) scale(.8)' }],
	creator: [{ d: shoulders(12, 13.5, 8, 21.5), tone: 'body' }, ...front(circle(12, 7.5, 4.25))],
	media: [{ d: r(8.5, 2, 13, 16, 2.5), tone: 'body' }, ...front(r(2.5, 6, 13, 16, 2.5)), { d: play(8.7, 14, 0.85), tone: 'hole' }],
	insights: [{ d: `${r(2.5, 12, 5, 9.5, 1.5)}${r(16.5, 8, 5, 13.5, 1.5)}`, tone: 'body' }, { d: r(9.5, 2.5, 5, 19, 1.5), tone: 'lit' }],
	landing: [{ d: r(2, 3, 20, 15, 2.5), tone: 'body' }, { d: `${circle(5.5, 6.5, 1)}${circle(8.5, 6.5, 1)}${circle(11.5, 6.5, 1)}`, tone: 'hole' }, ...front('M12.5 9.5v11.2l2.9-2.7 1.9 3.9 2-1-1.9-3.8h4Z')],
	collabs: [{ d: `${circle(8.5, 6.5, 3.25)}${shoulders(8.5, 11.5, 6, 18)}`, tone: 'body' }, ...front(`${circle(15.5, 10, 3.5)}${shoulders(15.5, 15, 6.5, 22)}`)],
	comments: [{ d: 'M2 4.5A2.5 2.5 0 0 1 4.5 2h9A2.5 2.5 0 0 1 16 4.5V10a2.5 2.5 0 0 1-2.5 2.5H8.5l-4 3v-3A2.5 2.5 0 0 1 2 10Z', tone: 'body' }, ...front('M8 11.5A2.5 2.5 0 0 1 10.5 9h9a2.5 2.5 0 0 1 2.5 2.5V17a2.5 2.5 0 0 1-2.5 2.5V22l-3.5-2.5h-5.5A2.5 2.5 0 0 1 8 17Z')],
	tagged: [{ d: r(2, 2, 16, 16, 2.5), tone: 'body' }, ...front(TAG, 'translate(10 10) scale(.55)'), { d: circle(7.5, 7.5, 2), tone: 'hole', t: 'translate(10 10) scale(.55)' }],
	soon: [{ d: circle(12, 12, 10), tone: 'body' }, { d: 'M12 6.5V12l3.5 2.5', tone: 'lit', line: true, w: 2 }],
	research: [{ d: r(2.5, 2, 13, 17, 2.5), tone: 'body' }, { d: `${circle(14.5, 13.5, 4.25)}M17.6 16.6l3.9 3.9`, tone: 'cut', line: true, w: 4 }, { d: `${circle(14.5, 13.5, 4.25)}M17.6 16.6l3.9 3.9`, tone: 'lit', line: true, w: 2 }],
	paid: [{ d: 'M3.5 8.5H7l7.1-4.3a.6.6 0 0 1 .9.51v14.58a.6.6 0 0 1-.9.51L7 15.5H3.5A1.5 1.5 0 0 1 2 14v-4a1.5 1.5 0 0 1 1.5-1.5Z', tone: 'body' }, { d: 'M18 9a4 4 0 0 1 0 6M20.5 6.5a7.6 7.6 0 0 1 0 11', tone: 'lit', line: true, w: 2 }],
	organic: [{ d: r(2, 2, 15, 15, 2.5), tone: 'body' }, ...front('M16.5 21.5s-5-2.9-5-6.4a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1c0 3.5-5 6.4-5 6.4Z')],
	creators: [{ d: `${r(2, 6, 14, 12, 2.5)}M17 10.2l4.1-2.46a.6.6 0 0 1 .9.52v7.48a.6.6 0 0 1-.9.52L17 13.8Z`, tone: 'body' }, { d: circle(9, 12, 3), tone: 'lit' }],
	monitor: [{ d: 'M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z', tone: 'body' }, { d: circle(12, 12, 4.5), tone: 'lit' }, { d: circle(12, 12, 1.75), tone: 'hole' }],
	trend: [{ d: 'M2 21.5V16.5l6-6 4 4 7-7H22v14Z', tone: 'body' }, { d: 'M2 16.5l6-6 4 4 8.5-8.5M15.5 6H21v5.5', tone: 'cut', line: true, w: 4 }, { d: 'M2 16.5l6-6 4 4 8.5-8.5M15.5 6H21v5.5', tone: 'lit', line: true, w: 2 }],
	build: [{ d: r(2, 3.5, 20, 17, 2.5), tone: 'body' }, { d: 'M9 9l-3 3 3 3M15 9l3 3-3 3', tone: 'lit', line: true, w: 2 }],
	templates: [{ d: `${r(3, 3, 18, 7, 1.5)}${r(14, 13, 7, 3, 1.5)}${r(14, 18, 5, 3, 1.5)}`, tone: 'body' }, { d: r(3, 13, 8, 8, 1.5), tone: 'lit' }],
	docs: [{ d: 'M11.25 5.6C8.8 3.9 5.6 3.5 2 4.4v14.2c3.6-.9 6.8-.5 9.25 1.2Z', tone: 'body' }, { d: 'M12.75 5.6c2.45-1.7 5.65-2.1 9.25-1.2v14.2c-3.6-.9-6.8-.5-9.25 1.2Z', tone: 'lit' }],
	blog: [{ d: 'M15 6l3 3L8 19l-4.3 1.3L5 16 15 6Z', tone: 'body' }, { d: 'M16.4 4.6l1.5-1.5a1.5 1.5 0 0 1 2.1 0l.9.9a1.5 1.5 0 0 1 0 2.1l-1.5 1.5Z', tone: 'lit' }],
	articles: [{ d: 'M6.5 2h8L20 7.5v13A1.5 1.5 0 0 1 18.5 22h-12A1.5 1.5 0 0 1 5 20.5v-17A1.5 1.5 0 0 1 6.5 2Z', tone: 'body' }, { d: 'M8.5 12h7M8.5 15.5h7M8.5 19h4', tone: 'cut', line: true, w: 2 }, { d: 'M14.5 2v4a1.5 1.5 0 0 0 1.5 1.5h4Z', tone: 'lit' }],
	demos: [{ d: circle(12, 12, 10), tone: 'body' }, { d: play(12.6, 12), tone: 'lit' }],
	careers: [{ d: r(2, 7.5, 20, 13.5, 2.5), tone: 'body' }, { d: 'M9 7.5V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v2', tone: 'body', line: true, w: 2 }, { d: r(2, 12.5, 20, 2.5, 0), tone: 'lit' }],
}

const TONE: Record<Tone, string> = {
	body: 'var(--glyph-body, var(--ds-color-neutral-6))',
	lit: 'var(--glyph-lit, var(--ds-color-fg-soft))',
	cut: 'var(--glyph-cut, var(--ds-color-surface))',
	hole: 'var(--glyph-cut, var(--ds-color-surface))',
}

/** The glyph's paths as SVG markup (the svg's children), the same in both flavors. */
export function navIconPaths(name: NavIconName): string {
	return (ICONS[name] ?? ICONS.soon)
		.map((p) => {
			const t = p.t ? ` transform="${p.t}"` : ''
			return p.line
				? `<path d="${p.d}"${t} fill="none" style="stroke: ${TONE[p.tone]}" stroke-width="${p.w ?? 3}" stroke-linecap="round" stroke-linejoin="round"></path>`
				: `<path d="${p.d}"${t} style="fill: ${TONE[p.tone]}"></path>`
		})
		.join('')
}

/** The 12px chevron after a menu's label (and the 16px one in the phone sheet). */
export const CHEVRON_PATH = '<path d="M3 4.5 6 7.5 9 4.5"></path>'

/** The hover intent before a menu opens and the grace before it closes when the pointer leaves (site --dur-menu-*). */
export const MENU_INTENT_MS = 80
export const MENU_GRACE_MS = 240
/** The live card's crossfade (the leaving picture stays this long). */
export const LIVE_CROSSFADE_MS = 200
