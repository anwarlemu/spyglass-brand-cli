export interface PricingPanelsContent {
	/** The headline, one line each. */
	lines: string[]
	/** The terms under it; each sentence keeps to one line on phones. */
	note: string
	primary: { label: string; href: string }
	secondary: { label: string; href: string }
}
export interface PanelCreative extends ImageSlot {
	brand?: string
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
/**
 * <spyglass-pricing-panels-block>

 */
export declare class PricingPanelsBlock extends HTMLElement {
  content: PricingPanelsContent;
  sets: PanelCreative[][];
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-pricing-panels-block': PricingPanelsBlock;
  }
}
