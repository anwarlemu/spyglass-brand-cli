export type ErrorContent = { lines: string[]; lead: string; retry: string; home: { label: string; href: string; }; }
export type ErrorSection = "head"
/**
 * <spyglass-error-page>
 * @fires retry When Try again is pressed.
 */
export declare class ErrorPage extends HTMLElement {
  content: { lines: string[]; lead: string; retry: string; home: { label: string; href: string; }; };
  sections?: "head"[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-error-page': ErrorPage;
  }
}
