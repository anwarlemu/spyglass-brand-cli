export interface WheelItem {
  key: string
  label: string
  line: string
  href: string
  linkLabel: string
  pairs: [WheelPicture, WheelPicture][]
}
export interface WheelPicture extends ImageSlot {
  /** The image's width over its height: a narrower image fills the card's height, a wider one its width. */
  ratio?: number
  brand?: string
  caption?: string
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
export interface WheelRipple {
  samples: number
  reach: number
  slope: number
  ring: (canvas: HTMLCanvasElement) => WheelRingGeometry | null
  sample: (out: Float32Array) => boolean
  frozen: () => boolean
}
export interface WheelRingGeometry { cx: number; cy: number; rx: number; ry: number; cardW: number; cardH: number }
/**
 * <spyglass-use-case-wheel>
 * @fires change detail.index is the audience turned to.
 * @slot light A light layer behind the ring.
 */
export declare class UseCaseWheel extends HTMLElement {
  sectionId: string;
  headline: string;
  items: WheelItem[];
  as: "h2" | "h1";
  autoplay: boolean;
  active: number;
  ripple: WheelRipple;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-use-case-wheel': UseCaseWheel;
  }
}
