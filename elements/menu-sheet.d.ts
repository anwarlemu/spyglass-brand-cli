/**
 * <spyglass-menu-sheet>
 * @slot brand The lockup link in the sheet's bar.
 * @slot action Beside the close button.
 * @slot (default) The links.
 * @slot foot Pinned at the foot.
 */
export declare class MenuSheet extends HTMLElement {
  label: string;
  closeLabel: string;
  until: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-menu-sheet': MenuSheet;
  }
}
