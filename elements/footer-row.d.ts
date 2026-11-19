export interface FooterLink { label: string; href: string }
/**
 * <spyglass-footer-row>

 */
export declare class FooterRow extends HTMLElement {
  domain: string;
  domainHref?: string | undefined;
  homeHref?: string | undefined;
  caps: boolean;
  links: FooterLink[];
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-footer-row': FooterRow;
  }
}
