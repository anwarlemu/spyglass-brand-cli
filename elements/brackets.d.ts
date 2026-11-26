/**
 * <spyglass-brackets>

 */
export declare class Brackets extends HTMLElement {
  offset?: number | undefined;
  arm?: number | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-brackets': Brackets;
  }
}
