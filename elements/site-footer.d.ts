export interface SiteFooterColumn { title: string; links: SiteFooterLink[]; wide?: boolean }
export interface SiteFooterLink { label: string; href?: string }
/**
 * <spyglass-site-footer>

 */
export declare class SiteFooter extends HTMLElement {
  columns: SiteFooterColumn[];
  legal?: string | undefined;
  homeHref: string;
  soon: string;
  wordmark: boolean;
  seed: number;
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-site-footer': SiteFooter;
  }
}
