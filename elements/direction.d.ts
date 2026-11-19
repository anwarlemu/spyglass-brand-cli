/**
 * <spyglass-direction>
 * @fires direction-change The direction changed (detail.value).
 * @slot (default) The content.
 */
export declare class Direction extends HTMLElement {
  direction: "ltr" | "rtl";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-direction': Direction;
  }
}
