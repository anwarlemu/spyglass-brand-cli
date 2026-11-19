export type AboutContent = { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; hero: { eyebrow: string; headline: string; body: string; }; row: ({ brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; })[]; beliefs: { title: string; items: { title: string; body: string; }[]; }; stats: { title: string; items: { value: string; label: string; }[]; }; join: { title: string; body: string; cta: { label: string; href: string; }; }; footer: { domain: string; links: { label: string; href: string; }[]; }; }
/**
 * <spyglass-about-page>

 */
export declare class AboutPage extends HTMLElement {
  content: { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; hero: { eyebrow: string; headline: string; body: string; }; row: ({ brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; })[]; beliefs: { title: string; items: { title: string; body: string; }[]; }; stats: { title: string; items: { value: string; label: string; }[]; }; join: { title: string; body: string; cta: { label: string; href: string; }; }; footer: { domain: string; links: { label: string; href: string; }[]; }; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-about-page': AboutPage;
  }
}
