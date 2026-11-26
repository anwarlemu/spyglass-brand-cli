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
 * <spyglass-connect-menu>
 * @fires copy After the prompt is copied; detail.prompt is the text.
 */
export declare class ConnectMenu extends HTMLElement {
  content: ConnectContent;
  marks: string[];
  up: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-connect-menu': ConnectMenu;
  }
}
