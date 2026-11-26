export interface PageAction { label: string; href: string }
/**
 * <spyglass-page-close>
 * @slot control The main control in place of the connect menu.
 */
export declare class PageClose extends HTMLElement {
  closeId: string;
  lines: string[];
  note: string;
  primary: PageAction;
  secondary: PageAction;
  connect: boolean;
  texture: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-page-close': PageClose;
  }
}
