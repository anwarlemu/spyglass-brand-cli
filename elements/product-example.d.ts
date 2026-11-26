export interface CodeTab { id: string; label: string; code: string; language?: string }
export interface ProductExampleSpec { label: string; value: string }
export interface ProductExampleMedia { label: string; items: { brand?: string; tone?: number; caption?: string; src?: string; alt?: string; fit?: ImageFit; position?: string; meta: string }[] }
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
/**
 * <spyglass-product-example>

 */
export declare class ProductExample extends HTMLElement {
  question: string;
  tabs: CodeTab[];
  response: string;
  specs: ProductExampleSpec[];
  media?: ProductExampleMedia | undefined;
  heading: string;
  codeLabel: string;
  responseLabel: string;
  status: string;
  copy: { label: string; copiedLabel: string; name: string; };
  prefix: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-product-example': ProductExample;
  }
}
