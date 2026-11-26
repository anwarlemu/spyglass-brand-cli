export interface ProductFeature { headline: string; text: string; link?: { label: string; href: string } }
/**
 * <spyglass-product-features>
 * @slot visual-1 The first row's picture (visual-2, visual-3... for the next rows).
 */
export declare class ProductFeatures extends HTMLElement {
  features: ProductFeature[];
  prefix: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-product-features': ProductFeatures;
  }
}
