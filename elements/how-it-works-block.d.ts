export interface HowItWorksContent {
	headline: string
	lead: string
	steps: { title: string; body: string }[]
	/** The quiet button beside the connect menu. */
	secondary: { label: string; href: string }
	marksLabel: string
}
export interface HowMark {
	name: string
	href: string
	/** The mark (an SVG file, drawn as a mask in the type's color, 24px). Leave out for its first letter. */
	src?: string
}
export interface ConnectContent {
	/** The trigger's label. */
	label: string
	/** The list's accessible name. */
	menuLabel: string
	/** The quiet word at the end of each row. */
	open: string
	copy: { label: string; done: string }
	/** What the copy row puts on the clipboard. */
	prompt: string
	clients: ConnectClient[]
}
export interface ConnectClient {
	id: string
	name: string
	/** One line under the name. */
	description: string
	href: string
	/** Opens in a new tab. */
	web?: boolean
	/** The client's mark (an SVG file, drawn as a White mask in a 16px square). Leave out for its first letter. */
	mark?: string
}
export interface SessionContent {
	server: string
	status: string
	label: string
	composer: string
	questions: readonly SessionQuestion[]
}
export interface SessionQuestion {
	/** An @mention set in Medium before the question. */
	mention?: string
	text: string
	tool: string
	args: string
	reply: string
	columns: readonly [string, string]
	rows: { label: string; value: string }[]
	/** The four creatives in the answer: images, or placeholder tones (1 to 4). */
	images: (ImageSlot & { alt: string; tone?: 1 | 2 | 3 | 4 })[]
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
 * <spyglass-how-it-works-block>

 */
export declare class HowItWorksBlock extends HTMLElement {
  content: HowItWorksContent;
  marks: HowMark[];
  connect?: ConnectContent | undefined;
  session?: SessionContent | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-how-it-works-block': HowItWorksBlock;
  }
}
