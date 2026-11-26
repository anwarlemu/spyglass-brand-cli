export type TemplatesPageContent = { chrome: { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; short: string; }; }; footer: { columns: ({ title: string; wide: boolean; links: { label: string; href: string; }[]; } | { title: string; links: { label: string; href: string; }[]; wide?: undefined; })[]; legal: string; }; close: { lines: string[]; note: string; primary: { label: string; href: string; }; }; }; wall: TemplatesWallContent; cities: { id: string; headline: string; lead: string; status: string; rows: { key: string; name: string; href: string; line: string; items: TemplateCityItem[]; }[]; }; faq: { id: string; headline: string; lead: string; docs: { label: string; href: string; }; items: { q: string; a: string; }[]; }; close: { lines: string[]; note: string; primary: { label: string; href: string; }; secondary: { label: string; href: string; }; }; }
export interface TemplatesWallContent {
	/** The line over the rolling chip. */
	headline: string
	/** The names the chip rolls through, one per step. */
	names: string[]
	lead: string
	/** The quiet line under the lead (the site's "Coming soon"). */
	status: string
}
export interface TemplateCityItem extends ImageSlot {
	key: string
	alt: string
	title: string
	meta?: string
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
export interface TemplatesBlocks {
	/** The wall's pictures, used in turn (a src or { src, fit, position }). */
	wall?: { pictures?: (string | ImageSlot)[] }
	/** The automation run's creatives (each with `src`, `alt`, `fit`, `position`). */
	run?: { items?: RunItem[] }
}
export interface RunItem extends Omit<ImageSlot, 'alt'> {
	/** The advertiser. */
	brand: string
	/** The ad's headline or product. */
	title: string
	/** What the creative shows (read to screen readers with the facts). */
	alt?: string
	/** The poster or still image (fit and position place it). Without one the card draws a neutral placeholder. */
	src?: string
	/** A short muted loop played in the card (src is its poster). */
	video?: string
	/** The placeholder's neutral gradient, 1 (darkest) to 4. */
	tone?: 1 | 2 | 3 | 4
	/** Short facts: the ones that do not repeat the numbers show as chips in the note. */
	facts?: string[]
	/** First seen, YYYY-MM-DD. */
	start: string
	/** Last seen, YYYY-MM-DD (an ended ad). */
	end?: string
	/** An organic post instead of an ad: where and how many views. */
	post?: { channel: string; views: string }
	/** Where it was found, in the note's foot (the ad library, or the post's channel by default). */
	source?: string
	/** The archive id, shown as media/<first 8>. */
	media?: string
}
export type TemplatesSection = "close" | "run" | "faq" | "wall" | "cities"
/**
 * <spyglass-templates-page>
 * @slot fan Your own arrangement of the rows in place of the row fan.
 */
export declare class TemplatesPage extends HTMLElement {
  content: { chrome: { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; short: string; }; }; footer: { columns: ({ title: string; wide: boolean; links: { label: string; href: string; }[]; } | { title: string; links: { label: string; href: string; }[]; wide?: undefined; })[]; legal: string; }; close: { lines: string[]; note: string; primary: { label: string; href: string; }; }; }; wall: TemplatesWallContent; cities: { id: string; headline: string; lead: string; status: string; rows: { key: string; name: string; href: string; line: string; items: TemplateCityItem[]; }[]; }; faq: { id: string; headline: string; lead: string; docs: { label: string; href: string; }; items: { q: string; a: string; }[]; }; close: { lines: string[]; note: string; primary: { label: string; href: string; }; secondary: { label: string; href: string; }; }; };
  menus?: HeaderMenus | undefined;
  blocks: TemplatesBlocks;
  sections?: ("close" | "run" | "faq" | "wall" | "cities")[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-templates-page': TemplatesPage;
  }
}
