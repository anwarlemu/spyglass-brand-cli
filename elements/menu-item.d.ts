/**
 * <spyglass-menu-item>
 * @fires select The row was chosen.
 * @slot (default) The row: an icon, the label, a count or a check.
 */
export declare class MenuItem extends HTMLElement {
  href?: string | undefined;
  current: boolean;
  danger: boolean;
  disabled: boolean;
  keepOpen: boolean;
  itemRole: string;
  checked?: boolean | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-menu-item': MenuItem;
  }
}
