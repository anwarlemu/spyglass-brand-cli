/**
 * <spyglass-empty>
 * @slot (default) The actions (buttons).
 * @slot icon A 20px Lucide icon.
 */
export declare class Empty extends HTMLElement {
  heading: string;
  description?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-empty': Empty;
  }
}
