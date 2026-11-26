export interface ScrollStoryData {
	id: string
	/** The section's name for assistive tech (visually hidden). */
	title: string
	chapters: StoryChapter[]
	pieces: StoryPiece[]
}
export interface StoryChapter {
	id: string
	heading: string
	text: string
	side: 'top' | 'left' | 'right'
	mode?: 'static' | 'reveal' | 'scroll'
	in: number
	out?: number
	outRate?: 'exit'
	/** The still arrangement shown under the words when the story stacks. */
	still: { layout: StoryLayout; pieces: string[] }
}
export type StoryLayout = 'board' | 'rank' | 'focus' | 'page' | 'result'
export type StoryPiece = PieceBase &
	(
		| { kind: 'image'; image: StoryImage; badge?: string }
		| { kind: 'board'; title: string; meta: string; logo?: StoryLogo; logos?: StoryLogo[]; more?: number; action?: string; query?: string; filters?: string[]; compact?: boolean }
		| { kind: 'chip'; label: string; value: string }
		| { kind: 'page'; image: StoryImage; url: string; meta: string }
		| { kind: 'thread'; title: string; meta: string; tabs?: string[]; rows: { who: string; text: string; likes?: string; avatar?: string }[] }
		| { kind: 'profile'; logo: StoryLogo; name: string; handle: string; meta: string; action: string; mark?: string; posts: StoryImage[]; footer: string }
		| { kind: 'result'; title: string; meta: string; rows: { title: string; detail: string; figure: string; image: StoryImage; logo?: StoryLogo; mark?: string }[] }
	)
export interface PieceBase {
	id: string
	w: number
	h: number
	keys: StoryKey[]
	/** The chapter whose words this piece rides with. */
	withText?: number
	/** Blend into riding with the words between two moments. */
	withTextFrom?: { from: number; to: number }
}
export interface StoryKey {
	at: number
	x: number
	y: number
	s?: number
	o?: number
	b?: number
	m?: number
	e?: StoryEase
}
export type StoryEase = 'linear' | 'in' | 'out' | 'inOut'
export interface StoryImage extends ImageSlot {
	alt: string
	brand?: string
	caption?: string
	tone?: 1 | 2 | 3 | 4
	/** The channel's mark (an image) in the corner; none by default (no third-party marks shipped). */
	mark?: string
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
export interface StoryLogo {
	name: string
	src?: string
}
export type ScrollStoryPreset = "landing" | "research" | "sentiment" | "channels"
export interface StoryAction {
	label: string
	href: string
}
/**
 * <spyglass-scroll-story>

 */
export declare class ScrollStory extends HTMLElement {
  story?: ScrollStoryData | undefined;
  preset: "landing" | "research" | "sentiment" | "channels";
  actions?: StoryAction[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-scroll-story': ScrollStory;
  }
}
