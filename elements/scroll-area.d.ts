/**
 * <spyglass-scroll-area>
 * @slot (default) The content.
 */
export declare class ScrollArea extends HTMLElement {
  label?: string | undefined;
  maxHeight?: string | undefined;
  axis: "y" | "x" | "both";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-scroll-area': ScrollArea;
  }
}
