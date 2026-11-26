/**
 * <spyglass-menubar-menu>
 * @slot (default) The rows.
 */
export declare class MenubarMenu extends HTMLElement {
  label: string;
  width: string;
  focusTrigger(): void;
  openMenu(focus?: "none" | "first" | "last", keyboard?: boolean): Promise<void>;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-menubar-menu': MenubarMenu;
  }
}
