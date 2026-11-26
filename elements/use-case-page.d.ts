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
export interface UseCaseHeroContent {
	/** The heading's id stem (the page's slug). */
	id: string
	name: string
	line: string
	/** Who it is for, under the actions ("For creative strategists..."; the period is added). */
	forWho: string
	primary: UseCaseAction
	secondary: UseCaseAction
	/** The visual's source note, for assistive tech. */
	source?: string
}
export interface UseCaseAction {
	label: string
	href: string
}
export type ScrollStoryPreset = "landing" | "research" | "sentiment" | "channels"
export interface StoryAction {
	label: string
	href: string
}
export interface Story {
  company: string
  /** The company's mark; without one the company is set as text. */
  logo?: StoryMark
  quote: string
  name: string
  role: string
  /** The person's photo, cropped round; without one, their initials. */
  photo?: string
}
export interface StoryMark {
  src: string
  /** Width over height. */
  ratio: number
  /** Height in px: 16, 20, 24 or 32. */
  height: number
}
export interface UseCaseFaqItem {
	q: string
	a: string
}
export type SiteChrome = { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; short: string; }; }; footer: { columns: ({ title: string; wide: boolean; links: { label: string; href: string; }[]; } | { title: string; links: { label: string; href: string; }[]; wide?: undefined; })[]; legal: string; }; close: { lines: string[]; note: string; primary: { label: string; href: string; }; }; }
export interface ChatContent {
	server: string
	status: string
	composer: string
	/** The chat's name for assistive tech. */
	label: string
	/** The chips' group name. */
	chipsLabel: string
	turns: readonly ChatTurn[]
}
export interface ChatTurn {
	/** The chip that picks this question. */
	chip: string
	/** An @mention typed before the question. */
	mention?: string
	question: string
	/** "Worked for 3s". */
	status: string
	tool: string
	args: string
	lead: string
	columns: readonly [string, string]
	rows: ChatRow[]
	/** A post the answer leads with (a picture, a title and a detail) instead of a plain lead line. */
	post?: { picture: ChatPicture; title: string; detail: string }
}
export interface ChatRow {
	label: string
	detail: string
	value: string
	picture?: ChatPicture
}
export interface ChatPicture extends ImageSlot {
	alt: string
	/** Width over height (the strip on phones keeps it). */
	ratio?: number
	tone?: 1 | 2 | 3 | 4
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
export interface BuildContent {
	url: string
	builtOn: string
	title: string
	meta: string
	call: { method: string; path: string; lines: { key: string; value: string | null }[] }
	tiles: BuildTile[]
	sorts: BuildSort[]
	/** What the visual shows, for assistive tech. */
	description: string
}
export interface BuildTile extends ImageSlot {
	id: string
	alt: string
	tone?: 1 | 2 | 3 | 4
	/** The badge for each sort key. */
	figure: Record<string, string>
}
export interface BuildSort {
	key: string
	label: string
	/** The request's sortBy value. */
	sortBy: string
	/** Tile ids in grid order. */
	order: string[]
}
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
export interface UseCaseBlocks {
	/** The scroll story's data in place of its preset (lib/scroll-story.ts; its images take `src`, `alt`, `fit`, `position`). */
	story?: { story?: ScrollStoryData }
	/** The wheel's audiences, each with three pairs of pictures. */
	wheel?: { items?: WheelItem[] }
}
export interface ScrollStoryData {
	id: string
	/** The section's name for assistive tech (visually hidden). */
	title: string
	chapters: StoryChapter[]
	pieces: StoryPiece[]
}
export interface StoryChapter {
	id: string
	heading: string
	text: string
	side: 'top' | 'left' | 'right'
	mode?: 'static' | 'reveal' | 'scroll'
	in: number
	out?: number
	outRate?: 'exit'
	/** The still arrangement shown under the words when the story stacks. */
	still: { layout: StoryLayout; pieces: string[] }
}
export type StoryLayout = 'board' | 'rank' | 'focus' | 'page' | 'result'
export type StoryPiece = PieceBase &
	(
		| { kind: 'image'; image: StoryImage; badge?: string }
		| { kind: 'board'; title: string; meta: string; logo?: StoryLogo; logos?: StoryLogo[]; more?: number; action?: string; query?: string; filters?: string[]; compact?: boolean }
		| { kind: 'chip'; label: string; value: string }
		| { kind: 'page'; image: StoryImage; url: string; meta: string }
		| { kind: 'thread'; title: string; meta: string; tabs?: string[]; rows: { who: string; text: string; likes?: string; avatar?: string }[] }
		| { kind: 'profile'; logo: StoryLogo; name: string; handle: string; meta: string; action: string; mark?: string; posts: StoryImage[]; footer: string }
		| { kind: 'result'; title: string; meta: string; rows: { title: string; detail: string; figure: string; image: StoryImage; logo?: StoryLogo; mark?: string }[] }
	)
export interface PieceBase {
	id: string
	w: number
	h: number
	keys: StoryKey[]
	/** The chapter whose words this piece rides with. */
	withText?: number
	/** Blend into riding with the words between two moments. */
	withTextFrom?: { from: number; to: number }
}
export interface StoryKey {
	at: number
	x: number
	y: number
	s?: number
	o?: number
	b?: number
	m?: number
	e?: StoryEase
}
export type StoryEase = 'linear' | 'in' | 'out' | 'inOut'
export interface StoryImage extends ImageSlot {
	alt: string
	brand?: string
	caption?: string
	tone?: 1 | 2 | 3 | 4
	/** The channel's mark (an image) in the corner; none by default (no third-party marks shipped). */
	mark?: string
}
export interface StoryLogo {
	name: string
	src?: string
}
export interface WheelItem {
  key: string
  label: string
  line: string
  href: string
  linkLabel: string
  pairs: [WheelPicture, WheelPicture][]
}
export interface WheelPicture extends ImageSlot {
  /** The image's width over its height: a narrower image fills the card's height, a wider one its width. */
  ratio?: number
  brand?: string
  caption?: string
  tone?: 1 | 2 | 3 | 4
}
export type UseCaseSection = "story" | "hero" | "proof" | "stories" | "close" | "faq" | "wheel"
/**
 * <spyglass-use-case-page>

 */
export declare class UseCasePage extends HTMLElement {
  content: UseCaseContent;
  visual: "build" | "chat";
  chat?: ChatContent | undefined;
  build?: BuildContent | undefined;
  still: boolean;
  menus?: HeaderMenus | undefined;
  blocks: UseCaseBlocks;
  sections?: ("story" | "hero" | "proof" | "stories" | "close" | "faq" | "wheel")[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-use-case-page': UseCasePage;
  }
}
