export interface ProductHeroAction { label: string; href: string }
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
/**
 * <spyglass-product-hero>
 * @slot light Your own live light over the still (without `live`), covering it once it draws.
 */
export declare class ProductHero extends HTMLElement {
  name: string;
  line: string;
  primary: ProductHeroAction;
  secondary: ProductHeroAction;
  sets: HeroSet[];
  unlit: boolean;
  live: boolean;
  placeholder: string;
  tool: string;
  prefix: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-product-hero': ProductHero;
  }
}
