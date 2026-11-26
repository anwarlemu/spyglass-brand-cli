export interface ResourceCard {
	title: string
	line: string
	href: string
	/** The small gray line at the foot ("4 templates", "docs.acme.com"). */
	meta?: string
	cover?: ResourceCover
}
export type ResourceCover = { kind: 'creatives'; items: ResourceCreative[] } | { kind: 'code'; source: string; language?: string }
export interface ResourceCreative extends ImageSlot {
	brand?: string
	caption?: string
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
export interface ResourceRow {
	title: string
	line: string
	/** Leave it out for a row that is not live (it is not a link). */
	href?: string
	/** The badge on the right ("Coming soon"). */
	badge?: string
}
/**
 * <spyglass-resource-cards>

 */
export declare class ResourceCards extends HTMLElement {
  cards: ResourceCard[];
  rows: ResourceRow[];
  rowsLabel: string;
  columns: 2 | 3;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-resource-cards': ResourceCards;
  }
}
