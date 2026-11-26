export type ChangelogContent = { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; title: string; body: string; entries: { date: string; title: string; body: string; items: string[]; image: CreativeImage | null; }[]; footer: { domain: string; links: { label: string; href: string; }[]; }; }
export interface CreativeImage extends ImageSlot {
	/** The placeholder's advertiser. */
	brand?: string
	/** The placeholder's headline. */
	caption?: string
	/** The placeholder's neutral gradient, 1 (darkest) to 4. */
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
export type ChangelogSection = "head" | "entries"
/**
 * <spyglass-changelog-page>

 */
export declare class ChangelogPage extends HTMLElement {
  content: { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; title: string; body: string; entries: { date: string; title: string; body: string; items: string[]; image: CreativeImage | null; }[]; footer: { domain: string; links: { label: string; href: string; }[]; }; };
  menus?: HeaderMenus | undefined;
  sections?: ("head" | "entries")[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-changelog-page': ChangelogPage;
  }
}
