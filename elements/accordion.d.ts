export type AccordionValue = string | string[] | null
/**
 * <spyglass-accordion>
 * @fires input A row opened or closed (read `value`).
 * @fires change A row opened or closed (read `value`).
 * @slot (default) The rows: <spyglass-accordion-item>.
 */
export declare class Accordion extends HTMLElement {
  multiple: boolean;
  value: AccordionValue;
  isOpen(v: string): boolean;
  toggle(v: string): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-accordion': Accordion;
  }
}
