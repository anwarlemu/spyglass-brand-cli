export type HomeContent = { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; short: string; }; }; proof: { title: string; logos: { name: string; src?: string | undefined; ratio?: number | undefined; height?: number | undefined; }[]; }; faq: { title: string; lead: string; action: { label: string; href: string; }; items: { q: string; a: string; }[]; }; footer: { legal: string; columns: ({ title: string; wide: boolean; links: { label: string; href: string; }[]; } | { title: string; links: { label: string; href: string; }[]; wide?: undefined; })[]; }; }
export interface HomeBlocks {
	/** The hero's MCP session (its creatives as images). */
	hero?: { session?: SessionContent }
	/** The features: the media strip's ads, the searches (each with `images`), the graph ring and the tally. */
	features?: { ads?: MediaAd[]; burst?: BurstContent; ring?: RingContent; tally?: TallyContent }
	/** The reasons: the archive's four creatives and the advertiser's mark. */
	why?: { creatives?: WhyCreative[]; logo?: string }
	/** The set-up steps' MCP session. */
	steps?: { session?: SessionContent }
	/** The case stories: each case's picture, and the quotes. */
	stories?: { cases?: StoryCase[]; quotes?: StoryQuote[] }
	/** The pricing strip's sets of five creatives. */
	pricing?: { sets?: PanelCreative[][] }
	/** The creatives the close cycles through. */
	close?: { creatives?: CloseCreative[] }
}
export interface SessionContent {
	server: string
	status: string
	label: string
	composer: string
	questions: readonly SessionQuestion[]
}
export interface SessionQuestion {
	/** An @mention set in Medium before the question. */
	mention?: string
	text: string
	tool: string
	args: string
	reply: string
	columns: readonly [string, string]
	rows: { label: string; value: string }[]
	/** The four creatives in the answer: images, or placeholder tones (1 to 4). */
	images: (ImageSlot & { alt: string; tone?: 1 | 2 | 3 | 4 })[]
}
export interface ImageSlot {
	/** The image. */
	src?: string
	/** What it shows; empty when it is decoration. */
	alt?: string
	/** How it fills its box (object-fit); cover by default. */
	fit?: ImageFit
	/** Where it is anchored in its box (object-position), for example "50% 20%" or "top". */
	position?: string
}
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
export interface MediaAd extends ImageSlot { h: number; ratio: number; tone: 1 | 2 | 3 | 4; days?: number; views?: string; ago?: number }
export interface BurstContent { aiLabel: string; columns: { instagram: string; tiktok: string; meta: string }; searching: string; added: string; searches: BurstSearch[] }
export interface BurstSearch { query: string; scrub: string[]; added: number; pool: (1 | 2 | 3 | 4)[]; answer: 1 | 2 | 3 | 4; row: BurstRow; /** The creatives the search finds ({ src, alt, fit, position }), used in turn; placeholder tones without them. */ images?: ImageSlot[] }
export interface BurstRow { name: string; category: string; instagram: string; tiktok: string | null; activeAds: number; logo?: string }
export interface RingContent { brand: string; nodes: RingNode[]; summary: string }
export interface RingNode extends ImageSlot { key: string; kind: string; source: string; angle: RingSlot; look: 'mark' | 'post' | 'page' | 'face'; tone?: 1 | 2 | 3 | 4 }
export type RingSlot = 30 | -150 | -30 | 150 | -90 | 90
export interface TallyContent { brand: string; meta: string; of: number; facts: { full: string; short: string }[]; rows: TallyRow[]; perOne: string; per: string; ads: string; summary: string }
export interface TallyRow extends ImageSlot { name: string; total: number; tone: 1 | 2 | 3 | 4 }
export interface WhyCreative extends ImageSlot { tone?: 1 | 2 | 3 | 4 }
export interface StoryCase extends StoryQuote {
	/** The headline figure and what it counts. */
	stat: string
	statLabel: string
	href: string
	/** The lead picture: an image ({ src, alt, fit, position }), or a placeholder tone (1 to 4). */
	picture?: ImageSlot & { tone?: 1 | 2 | 3 | 4 }
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
export interface StoryMark {
	/** The mark's file (SVG or PNG), drawn as a mask in the soft gray. */
	src: string
	/** Its width over its height. */
	ratio: number
	/** Its height in px (16 to 32; 20 in a lead story). */
	h?: number
}
export interface PanelCreative extends ImageSlot {
	brand?: string
	tone?: 1 | 2 | 3 | 4
}
export interface CloseCreative extends ImageSlot { tone?: 1 | 2 | 3 | 4 }
export interface HeaderMenus { products?: ProductsMenu; useCases?: UseCasesMenu; resources?: ResourcesMenu }
export interface ProductsMenu { offers: OfferRow[]; soon?: SoonRow; strip: { label: string; links: MenuLink[] } }
export interface OfferRow {
	key: string
	name: string
	line: string
	href: string
	icon: NavIconName
	/** Where it is live, in words: a chip on the live card. */
	platforms?: string[]
	/** The product's looping scene on the live card (a `product-visual` kind), as on the site. */
	visual?: ProductVisualKind
	/** A picture for the live card (a src or { src, alt, fit, position }; a product shot, never a person's photo by
	 * default); it takes the place of `visual`. Without either the card shows the product's glyph, marked as a placeholder. */
	picture?: string | ImageSlot
}
export type NavIconName =
	| 'brand' | 'creator' | 'media' | 'insights' | 'landing' | 'collabs' | 'comments' | 'tagged' | 'soon' | 'paid' | 'organic'
	| 'creators' | 'monitor' | 'trend' | 'build' | 'research' | 'templates' | 'docs' | 'blog' | 'articles' | 'demos' | 'careers'
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
export interface SoonRow {
	key: string
	name: string
	line: string
	href: string
	icon: NavIconName
	/** The live card's groups: a label over the platforms or integrations, in words. */
	groups: { label: string; items: string[] }[]
}
export interface MenuLink { label: string; href: string }
export interface UseCasesMenu { rows: CaseRow[]; all: MenuLink; more: MenuLink[] }
export interface CaseRow {
	key: string
	name: string
	line: string
	href: string
	icon: NavIconName
	/** The card's longer line. */
	card?: string
	/** Up to three pictures for the card (4:5), each a src or { src, alt, fit, position }; empty tiles when left out. */
	shots?: (string | ImageSlot)[]
}
export interface ResourcesMenu {
	rows: ResourceRow[]
	all: MenuLink
	feature: { title: string; line: string; href: string; code: string; external?: boolean }
	soonLabel: string
}
export interface ResourceRow { key: string; title: string; href: string; icon: NavIconName; soon?: boolean; external?: boolean }
export type HomeSection = "hero" | "proof" | "stories" | "close" | "features" | "faq" | "why" | "steps" | "pricing"
/**
 * <spyglass-home-page>

 */
export declare class HomePage extends HTMLElement {
  content: { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; short: string; }; }; proof: { title: string; logos: { name: string; src?: string; ratio?: number; height?: number; }[]; }; faq: { title: string; lead: string; action: { label: string; href: string; }; items: { q: string; a: string; }[]; }; footer: { legal: string; columns: ({ title: string; wide: boolean; links: { label: string; href: string; }[]; } | { title: string; links: { label: string; href: string; }[]; wide?: undefined; })[]; }; };
  blocks: HomeBlocks;
  menus?: HeaderMenus | undefined;
  sections?: ("hero" | "proof" | "stories" | "close" | "features" | "faq" | "why" | "steps" | "pricing")[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-home-page': HomePage;
  }
}
