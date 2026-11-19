/**
 * <spyglass-spinner>

 */
export declare class Spinner extends HTMLElement {
  size: "sm" | "md";
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-spinner': Spinner;
  }
}
