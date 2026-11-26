export interface WhyContent {
	headline: string
	lead: string
	reasons: WhyReason[]
	archive: { brand: string; channel: string; daysLive: string; today: string; runs: Run[]; summary: string }
	meter: { period: string; pool: string; used: string; seat: string; seatPrice: string; failed: string; rule: string; calls: PricingCall[] }
	custom: { stack: string[]; used: string; one: string; all: string; summary: string }
}
export interface WhyReason { key: WhyKey; title: string; line: string }
export type WhyKey = 'memory' | 'pricing' | 'custom'
export type Run = { start: string; stop: string | null }
export type PricingCall = { tool: string; returned: string | null; credits: number }
export interface WhyCreative extends ImageSlot { tone?: 1 | 2 | 3 | 4 }
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
 * <spyglass-why-block>

 */
export declare class WhyBlock extends HTMLElement {
  content: WhyContent;
  creatives: WhyCreative[];
  logo?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-why-block': WhyBlock;
  }
}
