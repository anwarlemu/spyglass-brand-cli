export interface FaqItem { q: string; a: string; id?: string }
/**
 * <spyglass-faq-block>

 */
export declare class FaqBlock extends HTMLElement {
  items: FaqItem[];
  heading: string;
  body?: string | undefined;
  action?: { label: string; href?: string; } | undefined;
  headId: string;
  arrangement: "split" | "stack";
  defaultOpen: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-faq-block': FaqBlock;
  }
}
