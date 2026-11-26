export interface FanRow { key: string, name: string, href: string, cta: string, srLabel?: string, items: FanItem[] }
export interface FanItem extends ImageSlot { key: string, title: string, meta?: string }
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
/**
 * <spyglass-row-fan>

 */
export declare class RowFan extends HTMLElement {
  rows: FanRow[];
  sizes: string;
  newTab: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-row-fan': RowFan;
  }
}
