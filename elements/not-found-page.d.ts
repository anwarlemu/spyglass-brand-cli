export type NotFoundContent = { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; eyebrow: string; headline: string; body: string; search: string; home: { label: string; href: string; }; footer: { domain: string; links: { label: string; href: string; }[]; }; }
/**
 * <spyglass-not-found-page>

 */
export declare class NotFoundPage extends HTMLElement {
  content: { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; eyebrow: string; headline: string; body: string; search: string; home: { label: string; href: string; }; footer: { domain: string; links: { label: string; href: string; }[]; }; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-not-found-page': NotFoundPage;
  }
}
