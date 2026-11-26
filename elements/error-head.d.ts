export interface ErrorHeadContent { lines: string[]; lead: string; retry: string; home: { label: string; href: string } }
/**
 * <spyglass-error-head>
 * @fires retry When the White button is pressed.
 */
export declare class ErrorHead extends HTMLElement {
  content: ErrorHeadContent;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-error-head': ErrorHead;
  }
}
