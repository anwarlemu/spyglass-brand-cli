/**
 * <spyglass-browser-frame>
 * @slot (default) The page.
 * @slot footer A row under the page.
 */
export declare class BrowserFrame extends HTMLElement {
  url: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-browser-frame': BrowserFrame;
  }
}
