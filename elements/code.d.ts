/**
 * <spyglass-code>

 */
export declare class Code extends HTMLElement {
  source: string;
  language: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-code': Code;
  }
}
