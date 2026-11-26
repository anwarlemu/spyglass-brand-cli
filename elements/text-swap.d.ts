/**
 * <spyglass-text-swap>

 */
export declare class TextSwap extends HTMLElement {
  text: string;
  unit?: string | undefined;
  tag?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-text-swap': TextSwap;
  }
}
