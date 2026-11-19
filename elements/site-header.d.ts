export interface HeaderLink { label: string; href: string; current?: boolean }
export interface HeaderAction { label: string; href: string }
/**
 * <spyglass-site-header>

 */
export declare class SiteHeader extends HTMLElement {
  links: HeaderLink[];
  cta?: HeaderAction | undefined;
  secondary?: HeaderAction | undefined;
  homeHref: string;
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-site-header': SiteHeader;
  }
}
