export interface FooterLink { label: string; href: string }
/**
 * <spyglass-footer-block>

 */
export declare class FooterBlock extends HTMLElement {
  domain: string;
  links: FooterLink[];
  homeHref: string;
  note?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-footer-block': FooterBlock;
  }
}
