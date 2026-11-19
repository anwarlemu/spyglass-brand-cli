export interface FaqItem { q: string; a: string }
/**
 * <spyglass-faq-block>

 */
export declare class FaqBlock extends HTMLElement {
  items: FaqItem[];
  heading: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-faq-block': FaqBlock;
  }
}
