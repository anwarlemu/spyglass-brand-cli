export interface TemplatesWallContent {
	/** The line over the rolling chip. */
	headline: string
	/** The names the chip rolls through, one per step. */
	names: string[]
	lead: string
	/** The quiet line under the lead (the site's "Coming soon"). */
	status: string
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
 * <spyglass-templates-wall>

 */
export declare class TemplatesWall extends HTMLElement {
  content: TemplatesWallContent;
  pictures?: (string | ImageSlot)[] | undefined;
  hero: boolean;
  at?: number | undefined;
  sectionId: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-templates-wall': TemplatesWall;
  }
}
