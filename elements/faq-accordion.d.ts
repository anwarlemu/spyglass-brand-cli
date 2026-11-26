export interface FaqAccordionItem { q: string; a: string; id?: string }
/**
 * <spyglass-faq-accordion>

 */
export declare class FaqAccordion extends HTMLElement {
  items: FaqAccordionItem[];
  defaultOpen: number;
  edge: "top" | "bottom";
  narrow: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-faq-accordion': FaqAccordion;
  }
}
