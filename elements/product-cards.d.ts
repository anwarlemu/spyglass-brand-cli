export interface ProductCardItem { name: string; line: string; endpoint?: string; href: string }
/**
 * <spyglass-product-cards>

 */
export declare class ProductCards extends HTMLElement {
  products: ProductCardItem[];
  columns: 4 | 3;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-product-cards': ProductCards;
  }
}
