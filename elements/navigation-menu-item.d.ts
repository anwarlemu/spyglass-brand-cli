/**
 * <spyglass-navigation-menu-item>
 * @slot (default) The panel's links.
 */
export declare class NavigationMenuItem extends HTMLElement {
  label: string;
  href?: string | undefined;
  active: boolean;
  width: string;
  focusTrigger(): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-navigation-menu-item': NavigationMenuItem;
  }
}
