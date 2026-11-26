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
 * <spyglass-testimonial>

 */
export declare class Testimonial extends HTMLElement {
  quote: string;
  name: string;
  position?: string | undefined;
  image?: string | ImageSlot | undefined;
  arrangement: "stacked" | "side";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-testimonial': Testimonial;
  }
}
