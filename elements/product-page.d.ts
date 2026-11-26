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
export interface HeroSet {
	question: string
	/** The row's accessible name. */
	resultsLabel: string
	results: HeroResult[]
}
export interface HeroResult {
	id: string
	/** The card's picture (4:5). */
	picture?: HeroPicture
	/** A second picture beside the first (a pair). */
	pair?: HeroPicture
	/** A figure instead of a picture. */
	stat?: { value: string; caption: string }
	/** Chips at the foot of the picture. */
	notes?: string[]
	/** A 20px mark beside the label. */
	mark?: string
	label: string
	meta?: string
	/** What turns up on hover or focus: a title and facts. */
	detail: { title: string; facts: { term: string; value: string }[] }
}
export interface HeroPicture { src: string; alt: string }
export interface ProductPageFeature {
	headline: string
	text: string
	link?: { label: string; href: string }
	visual: ProductVisualKind
	/** The visual's content, pictures included (product-visual's `data` for its kind); Acme placeholders without it. */
	data?: ProductVisualDataMap[ProductVisualKind]
}
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
export interface RecordData {
	labels: string[]
	sets: RecordSet[]
	/** Read by screen readers in place of the panel. */
	summary?: string
}
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
export interface ThreadData {
	/** The account the posts are from. */
	handle: string
	sets: { picture?: string | ImageSlot; meta: string; comments: ThreadComment[] }[]
	summary?: string
}
export interface ThreadComment {
	handle: string
	likes: string
	text: string
	avatar?: string
}
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
export interface ThemesData {
	title: string
	themes: { label: string; share: string; comments: { handle: string; text: string; avatar?: string }[] }[]
	summary?: string
}
export interface FiltersData {
	query: string
	filters: { label: string; value: string; step: number }[]
	rows: { handle: string; initial: string; avatar?: string; city: string; followers: string; out: number }[]
	summary?: string
}
export interface NarrowData {
	query: string
	filters: string[]
	/** The result count at each step: before any filter, then after each. */
	counts: string[]
	tiles: (ImageSlot & { out: number })[]
	summary?: string
}
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
export interface SheetData {
	brand: { name: string; logo?: string; note: string }
	views: string[]
	/** The switch's accessible name. */
	switchLabel: string
	rows: { key: string; picture?: string | ImageSlot; name: string; tag?: string; values: string[]; fill?: number[]; at: (number | null)[]; muted?: boolean }[]
	/** One per view, read by screen readers. */
	summary?: string[]
}
export interface BoardData {
	scenes: BoardScene[]
}
export interface BoardScene {
	brand: string
	logo?: string
	page: ImageSlot & { y?: number; domain: string; path: string; ads: string }
	tiles: (ImageSlot & { x?: number; y?: number; zoom?: number })[]
	creators: { handle: string; avatar?: string | ImageSlot }[]
}
export interface PatternsData {
	brand: string
	logo?: string
	window: string
	ads: (ImageSlot & { x?: number })[]
	views: { label: string; rows: { name: string; share: number }[]; top: number[] }[]
}
export type ProductContent = { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; short: string; }; }; primary: { label: string; href: string; }; docsLabel: string; proof: string; pricing: { note: string; secondary: { label: string; href: string; }; }; faq: { title: string; lead: string; }; close: { lines: string[]; note: string; primary: { label: string; href: string; }; }; footer: { columns: ({ title: string; wide: boolean; links: { label: string; href: string; }[]; } | { title: string; links: { label: string; href: string; }[]; wide?: undefined; })[]; legal: string; }; product: ProductPageContent; }
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
export type ProductSection = "hero" | "proof" | "close" | "features" | "faq" | "pricing" | "compare"
/**
 * <spyglass-product-page>

 */
export declare class ProductPage extends HTMLElement {
  product?: ProductPageContent | undefined;
  content: { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; short: string; }; }; primary: { label: string; href: string; }; docsLabel: string; proof: string; pricing: { note: string; secondary: { label: string; href: string; }; }; faq: { title: string; lead: string; }; close: { lines: string[]; note: string; primary: { label: string; href: string; }; }; footer: { columns: ({ title: string; wide: boolean; links: { label: string; href: string; }[]; } | { title: string; links: { label: string; href: string; }[]; wide?: undefined; })[]; legal: string; }; product: ProductPageContent; };
  live: boolean;
  menus?: HeaderMenus | undefined;
  sections?: ("hero" | "proof" | "close" | "features" | "faq" | "pricing" | "compare")[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-product-page': ProductPage;
  }
}
