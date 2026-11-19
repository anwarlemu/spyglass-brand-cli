export type PricingContent = { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; offer: { headline: string; }; plans: { title: string; price: string; features: string[]; cta: string; href: string; }[]; faq: { title: string; items: { q: string; a: string; }[]; }; footer: { domain: string; links: { label: string; href: string; }[]; }; }
/**
 * <spyglass-pricing-page>

 */
export declare class PricingPage extends HTMLElement {
  content: { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; offer: { headline: string; }; plans: { title: string; price: string; features: string[]; cta: string; href: string; }[]; faq: { title: string; items: { q: string; a: string; }[]; }; footer: { domain: string; links: { label: string; href: string; }[]; }; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-pricing-page': PricingPage;
  }
}
