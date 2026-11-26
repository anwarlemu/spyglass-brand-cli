export interface FeaturesContent {
	headline: string
	lead: string
	media: { title: string; body: string }
	accounts: { title: string; body: string }
	entity: { title: string; body: string }
	patterns: { title: string; body: string }
}
export interface MediaContent { query: string; across: string; soon: string; live: string[]; later: string[]; days: string; views: string; ago: string; summary: string }
export interface MediaAd extends ImageSlot { h: number; ratio: number; tone: 1 | 2 | 3 | 4; days?: number; views?: string; ago?: number }
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
export interface BurstContent { aiLabel: string; columns: { instagram: string; tiktok: string; meta: string }; searching: string; added: string; searches: BurstSearch[] }
export interface BurstSearch { query: string; scrub: string[]; added: number; pool: (1 | 2 | 3 | 4)[]; answer: 1 | 2 | 3 | 4; row: BurstRow; /** The creatives the search finds ({ src, alt, fit, position }), used in turn; placeholder tones without them. */ images?: ImageSlot[] }
export interface BurstRow { name: string; category: string; instagram: string; tiktok: string | null; activeAds: number; logo?: string }
export interface RingContent { brand: string; nodes: RingNode[]; summary: string }
export interface RingNode extends ImageSlot { key: string; kind: string; source: string; angle: RingSlot; look: 'mark' | 'post' | 'page' | 'face'; tone?: 1 | 2 | 3 | 4 }
export type RingSlot = 30 | -150 | -30 | 150 | -90 | 90
export interface TallyContent { brand: string; meta: string; of: number; facts: { full: string; short: string }[]; rows: TallyRow[]; perOne: string; per: string; ads: string; summary: string }
export interface TallyRow extends ImageSlot { name: string; total: number; tone: 1 | 2 | 3 | 4 }
/**
 * <spyglass-features-block>

 */
export declare class FeaturesBlock extends HTMLElement {
  content: FeaturesContent;
  media: MediaContent;
  ads: MediaAd[];
  burst: BurstContent;
  ring: RingContent;
  tally: TallyContent;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-features-block': FeaturesBlock;
  }
}
