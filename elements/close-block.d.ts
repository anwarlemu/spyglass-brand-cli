export interface CloseContent { headline: string; secondary: { label: string; href: string } }
export interface CloseCreative extends ImageSlot { tone?: 1 | 2 | 3 | 4 }
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
/**
 * <spyglass-close-block>

 */
export declare class CloseBlock extends HTMLElement {
  content: CloseContent;
  creatives: CloseCreative[];
  tags: string[];
  connect?: ConnectContent | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-close-block': CloseBlock;
  }
}
