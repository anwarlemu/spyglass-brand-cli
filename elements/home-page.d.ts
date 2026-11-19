export type HomeContent = { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; hero: { headline: string; body: string; action: { label: string; href: string; }; search: string; }; results: ({ brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; })[]; index: { headline: string; body: string; corridor: ({ brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; })[]; }; features: { title: string; body: string; }[]; stats: { title: string; items: { value: string; label: string; }[]; }; agents: { headline: string; ring: ({ brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; })[]; }; testimonial: { quote: string; name: string; position: string; }; offer: { headline: string; note: string; cta: { label: string; href: string; }; }; footer: { domain: string; links: { label: string; href: string; }[]; }; }
/**
 * <spyglass-home-page>

 */
export declare class HomePage extends HTMLElement {
  content: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; hero: { headline: string; body: string; action: { label: string; href: string; }; search: string; }; results: ({ brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; })[]; index: { headline: string; body: string; corridor: ({ brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; })[]; }; features: { title: string; body: string; }[]; stats: { title: string; items: { value: string; label: string; }[]; }; agents: { headline: string; ring: ({ brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; })[]; }; testimonial: { quote: string; name: string; position: string; }; offer: { headline: string; note: string; cta: { label: string; href: string; }; }; footer: { domain: string; links: { label: string; href: string; }[]; }; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-home-page': HomePage;
  }
}
