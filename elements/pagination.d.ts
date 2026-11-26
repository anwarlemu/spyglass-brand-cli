/**
 * <spyglass-pagination>
 * @fires page-change The page changed (detail.value; read `page`).
 */
export declare class Pagination extends HTMLElement {
  page: number;
  pages: number;
  siblings: number;
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-pagination': Pagination;
  }
}
