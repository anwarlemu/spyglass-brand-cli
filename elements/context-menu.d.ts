/**
 * <spyglass-context-menu>
 * @fires open It is opening (detail.context: the closest [data-context] value).
 * @slot (default) What the menu is for (a list whose rows carry data-context).
 * @slot menu The rows: <spyglass-menu-item slot="menu">, labels and separators.
 */
export declare class ContextMenu extends HTMLElement {
  label: string;
  width?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-context-menu': ContextMenu;
  }
}
