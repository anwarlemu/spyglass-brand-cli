export interface CaseStoriesContent {
	headline: string
	lead: string
	/** The link's words on a lead story ("Read the case study"). */
	read: string
}
export interface StoryCase extends StoryQuote {
	/** The headline figure and what it counts. */
	stat: string
	statLabel: string
	href: string
	/** The lead picture: an image ({ src, alt, fit, position }), or a placeholder tone (1 to 4). */
	picture?: ImageSlot & { tone?: 1 | 2 | 3 | 4 }
}
export interface StoryQuote {
	company: string
	mark?: StoryMark
	quote: string
	name: string
	/** Role and company, under the name. */
	role: string
	/** A 40px photo; the initials stand in without one. */
	photo?: string
}
export interface StoryMark {
	/** The mark's file (SVG or PNG), drawn as a mask in the soft gray. */
	src: string
	/** Its width over its height. */
	ratio: number
	/** Its height in px (16 to 32; 20 in a lead story). */
	h?: number
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
 * <spyglass-case-stories-block>

 */
export declare class CaseStoriesBlock extends HTMLElement {
  content: CaseStoriesContent;
  cases: StoryCase[];
  quotes: StoryQuote[];
  head: boolean;
  quoteCount: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-case-stories-block': CaseStoriesBlock;
  }
}
