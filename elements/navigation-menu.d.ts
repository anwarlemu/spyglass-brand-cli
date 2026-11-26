export interface NavigationMenuEntry extends HTMLElement { focusTrigger(): void }
/**
 * <spyglass-navigation-menu>
 * @slot (default) The entries: <spyglass-navigation-menu-item>.
 */
export declare class NavigationMenu extends HTMLElement {
  label: string;
  active: Element | null;
  entries(): NavigationMenuEntry[];
  setActive(item: Element | null): void;
  move(from: Element, step: number): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-navigation-menu': NavigationMenu;
  }
}
