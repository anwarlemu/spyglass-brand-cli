export interface ToastOptions {
	/** A line under the title. */
	description?: string
	/** One button beside the text. */
	action?: ToastAction
	/** How long it stays, in ms (4000 by default). */
	duration?: number
}
export interface ToastAction {
	/** The button's label. */
	label: string
	/** What it does; the toast closes after it. */
	onClick?: () => void
}
/**
 * <spyglass-sonner>

 */
export declare class Sonner extends HTMLElement {
  label: string;
  toast(title: string, options?: ToastOptions | undefined): number;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-sonner': Sonner;
  }
}
