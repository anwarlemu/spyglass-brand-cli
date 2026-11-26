export type EnterpriseHeroContent = { title: [string, string]; lead: string; primary: { label: string; href: string; }; secondary: { label: string; href: string; }; label: string; }
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
/**
 * <spyglass-enterprise-hero>

 */
export declare class EnterpriseHero extends HTMLElement {
  content: { title: [string, string]; lead: string; primary: { label: string; href: string; }; secondary: { label: string; href: string; }; label: string; };
  cards: RingCard[][];
  sectionId: string;
  at: number[];
  stepped: boolean[];
  shown: number | null;
  hint: number | null;
  said: string;
  held: number | null;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-enterprise-hero': EnterpriseHero;
  }
}
