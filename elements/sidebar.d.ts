/**
 * <spyglass-sidebar>
 * @fires collapsed-change It folded or unfolded (detail.value).
 * @slot (default) Labels and links.
 * @slot head The logo or the workspace.
 * @slot foot The account.
 */
export declare class Sidebar extends HTMLElement {
  label: string;
  collapsible: boolean;
  collapsed: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-sidebar': Sidebar;
  }
}
