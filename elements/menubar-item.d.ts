/**
 * <spyglass-menubar-item>
 * @fires select The row was chosen.
 * @slot (default) The row: an icon and the label.
 */
export declare class MenubarItem extends HTMLElement {
  shortcut?: string | undefined;
  danger: boolean;
  disabled: boolean;
  keepOpen: boolean;
  checked: boolean;
  itemRole: "menuitem" | "menuitemradio" | "menuitemcheckbox";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-menubar-item': MenubarItem;
  }
}
