export type SheetSide = 'right' | 'left' | 'top' | 'bottom'
/**
 * <spyglass-sheet>
 * @fires open-change It opened or closed (detail.value; read `open`).
 * @slot (default) The body.
 * @slot foot Buttons at the foot.
 */
export declare class Sheet extends HTMLElement {
  heading: string;
  description?: string | undefined;
  side: SheetSide;
  open: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-sheet': Sheet;
  }
}
