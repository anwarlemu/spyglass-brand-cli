export interface CompareRow { label: string; cells: CompareCell[] }
export type CompareCell = string
/**
 * <spyglass-product-compare>
 * @slot mark Replaces the logomark beside the last column's name.
 */
export declare class ProductCompare extends HTMLElement {
  headline: string;
  lead: string;
  columns: string[];
  rows: CompareRow[];
  yes: string;
  no: string;
  prefix: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-product-compare': ProductCompare;
  }
}
