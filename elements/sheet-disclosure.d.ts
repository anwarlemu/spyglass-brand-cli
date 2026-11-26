/**
 * <spyglass-sheet-disclosure>
 * @slot (default) The list it opens.
 */
export declare class SheetDisclosure extends HTMLElement {
  label: string;
  open: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-sheet-disclosure': SheetDisclosure;
  }
}
