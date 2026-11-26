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
 * <spyglass-mcp-session>

 */
export declare class McpSession extends HTMLElement {
  content: SessionContent;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-mcp-session': McpSession;
  }
}
