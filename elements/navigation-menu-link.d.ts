/**
 * <spyglass-navigation-menu-link>

 */
export declare class NavigationMenuLink extends HTMLElement {
  href?: string | undefined;
  heading: string;
  description?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-navigation-menu-link': NavigationMenuLink;
  }
}
