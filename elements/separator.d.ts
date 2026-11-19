/**
 * <spyglass-separator>

 */
export declare class Separator extends HTMLElement {
  orientation: "horizontal" | "vertical";
  semantic: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-separator': Separator;
  }
}
