export type EnterprisePageContent = { header: { links: ({ label: string; href: string; current?: undefined; } | { label: string; href: string; current: boolean; })[]; secondary: { label: string; href: string; }; }; proof: string; hero: { title: [string, string]; lead: string; primary: { label: string; href: string; }; secondary: { label: string; href: string; }; label: string; }; close: { title: [string, string]; note: string; primary: { label: string; href: string; }; secondary: { label: string; href: string; }; }; footer: { columns: ({ title: string; wide: boolean; links: { label: string; href: string; }[]; } | { title: string; links: { label: string; href: string; }[]; wide?: undefined; })[]; legal: string; }; }
export interface RingCard extends ImageSlot {
	/** The advertiser (the placeholder's label and the button's name). */
	brand: string
	/** The ad's headline. */
	title: string
	/** The creative's shape. */
	ratio: RingRatio
	/** The hook it uses, in the tag ("Hook: product showcase"). */
	hook: string
	/** The tag's lines under the hook: "Ran 7 days", "Posted 9 days ago". */
	meta: string[]
	/** The creative (fit and position place it; the button is named by the brand and title). Without one the card
	 * draws a neutral placeholder. */
	src?: string
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
export type RingRatio = '3:4' | '4:5' | '1:1'
export interface ProofLogo { name: string; src?: string; ratio?: number; height?: number }
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
export type EnterpriseFeaturesContent = { headline: string; data: { title: string; line: string; tools: { name: string; mark?: string | undefined; label?: string | undefined; }[]; question: string; answer: string; summary: string; }; archive: { title: string; line: string; live: string; source: string; scope: string; records: { brand: string; meta: string; status: string; picked?: boolean | undefined; live?: boolean | undefined; shot: FeatureShot; }[]; draft: string; app: string; stat: { value: string; label: string; }; summary: string; }; agents: { title: string; line: string; clients: { name: string; mark?: string | undefined; label?: string | undefined; }[]; hub: string; summary: string; }; engineers: { title: string; line: string; you: string; us: string; steps: [string, string, string]; summary: string; }; builds: { title: string; line: string; dashboard: { tab: string; caption: string; rows: { label: string; value: number; }[]; }; creators: { tab: string; caption: string; tool: { name: string; mark?: string | undefined; label?: string | undefined; }; rows: { name: string; note: string; avatar?: string | undefined; }[]; }; hooks: { tab: string; review: string; source: string; hook: string; rivals: string; ads: FeatureShot[]; }; summary: string; }; tools: { title: string; line: string; request: string; name: string; metric: string; options: { label: string; value: string; rows: number; }[]; tag: string[]; summary: string; }; reports: { title: string; line: string; messages: { text: string; channel: string; ads: [FeatureShot & { tag: string; }, FeatureShot & { tag: string; }]; }[]; summary: string; }; alpha: { title: string; line: string; workspace: string; shots: FeatureShot[]; ask: string; answer: string; product: string; answering: string; deleted: string; summary: string; }; }
export interface FeatureShot extends ImageSlot { tone?: 1 | 2 | 3 | 4; crop?: string }
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
export type EnterpriseSection = "hero" | "proof" | "close" | "run" | "features"
/**
 * <spyglass-enterprise-page>

 */
export declare class EnterprisePage extends HTMLElement {
  content: { header: { links: ({ label: string; href: string; current?: undefined; } | { label: string; href: string; current: boolean; })[]; secondary: { label: string; href: string; }; }; proof: string; hero: { title: [string, string]; lead: string; primary: { label: string; href: string; }; secondary: { label: string; href: string; }; label: string; }; close: { title: [string, string]; note: string; primary: { label: string; href: string; }; secondary: { label: string; href: string; }; }; footer: { columns: ({ title: string; wide: boolean; links: { label: string; href: string; }[]; } | { title: string; links: { label: string; href: string; }[]; wide?: undefined; })[]; legal: string; }; };
  cards: RingCard[][];
  logos: ProofLogo[];
  run: RunItem[];
  features: { headline: string; data: { title: string; line: string; tools: { name: string; mark?: string; label?: string; }[]; question: string; answer: string; summary: string; }; archive: { title: string; line: string; live: string; source: string; scope: string; records: { brand: string; meta: string; status: string; picked?: boolean; live?: boolean; shot: FeatureShot; }[]; draft: string; app: string; stat: { value: string; label: string; }; summary: string; }; agents: { title: string; line: string; clients: { name: string; mark?: string; label?: string; }[]; hub: string; summary: string; }; engineers: { title: string; line: string; you: string; us: string; steps: [string, string, string]; summary: string; }; builds: { title: string; line: string; dashboard: { tab: string; caption: string; rows: { label: string; value: number; }[]; }; creators: { tab: string; caption: string; tool: { name: string; mark?: string; label?: string; }; rows: { name: string; note: string; avatar?: string; }[]; }; hooks: { tab: string; review: string; source: string; hook: string; rivals: string; ads: FeatureShot[]; }; summary: string; }; tools: { title: string; line: string; request: string; name: string; metric: string; options: { label: string; value: string; rows: number; }[]; tag: string[]; summary: string; }; reports: { title: string; line: string; messages: { text: string; channel: string; ads: [FeatureShot & { tag: string; }, FeatureShot & { tag: string; }]; }[]; summary: string; }; alpha: { title: string; line: string; workspace: string; shots: FeatureShot[]; ask: string; answer: string; product: string; answering: string; deleted: string; summary: string; }; };
  menus?: HeaderMenus | undefined;
  sections?: ("hero" | "proof" | "close" | "run" | "features")[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-enterprise-page': EnterprisePage;
  }
}
