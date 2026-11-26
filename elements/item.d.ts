/**
 * <spyglass-item>
 * @slot (default) The title, in place of `heading`.
 * @slot media Before the title: an icon, a logo, a thumbnail.
 * @slot actions At the end, on a row without href only.
 */
export declare class Item extends HTMLElement {
  heading?: string | undefined;
  description?: string | undefined;
  variant: "default" | "outline" | "muted";
  size: "default" | "sm";
  href?: string | undefined;
  arrow: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-item': Item;
  }
}
