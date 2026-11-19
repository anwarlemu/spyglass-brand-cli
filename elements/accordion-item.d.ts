/**
 * <spyglass-accordion-item>
 * @slot (default) The answer.
 * @slot title The question, in place of `heading`.
 */
export declare class AccordionItem extends HTMLElement {
  value: string;
  heading?: string | undefined;
  disabled: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-accordion-item': AccordionItem;
  }
}
