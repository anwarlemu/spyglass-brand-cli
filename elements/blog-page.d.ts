export type BlogContent = { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; title: string; body: string; read: string; posts: { href: string; title: string; excerpt: string; date: string; category: string; image: { brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; }; }[]; footer: { domain: string; links: { label: string; href: string; }[]; }; }
/**
 * <spyglass-blog-page>

 */
export declare class BlogPage extends HTMLElement {
  content: { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; title: string; body: string; read: string; posts: { href: string; title: string; excerpt: string; date: string; category: string; image: { brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; }; }[]; footer: { domain: string; links: { label: string; href: string; }[]; }; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-blog-page': BlogPage;
  }
}
