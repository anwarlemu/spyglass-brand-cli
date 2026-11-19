export type ChangelogContent = { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; title: string; body: string; entries: ({ date: string; title: string; body: string; items: string[]; image: { brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; }; } | { date: string; title: string; body: string; items: string[]; image: null; })[]; footer: { domain: string; links: { label: string; href: string; }[]; }; }
/**
 * <spyglass-changelog-page>

 */
export declare class ChangelogPage extends HTMLElement {
  content: { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; title: string; body: string; entries: ({ date: string; title: string; body: string; items: string[]; image: { brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; }; } | { date: string; title: string; body: string; items: string[]; image: null; })[]; footer: { domain: string; links: { label: string; href: string; }[]; }; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-changelog-page': ChangelogPage;
  }
}
