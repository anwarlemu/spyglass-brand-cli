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
export interface RunContent {
	/** The quote over the run. */
	request: string
	/** The list's accessible name. */
	label: string
	/** The day the numbers count to, YYYY-MM-DD. */
	reportDay: string
}
/**
 * <spyglass-automation-run>

 */
export declare class AutomationRun extends HTMLElement {
  items: RunItem[];
  content: RunContent;
  sectionId: string;
  shown: number | null;
  noted: number | null;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-automation-run': AutomationRun;
  }
}
