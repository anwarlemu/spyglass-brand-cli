export type BlogPostContent = { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; back: { label: string; href: string; }; date: string; category: string; title: string; byline: string; image: { brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; }; body: ({ kind: "p" | "h2" | "quote"; text: string; } | { kind: "list"; items: string[]; } | { kind: "figure"; caption: string; images: { brand: string; tone: 1 | 2 | 3 | 4; caption?: string | undefined; }[]; })[]; related: { title: string; posts: { href: string; title: string; date: string; image: { brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; }; }[]; }; offer: { headline: string; note: string; cta: { label: string; href: string; }; }; footer: { domain: string; links: { label: string; href: string; }[]; }; }
/**
 * <spyglass-blog-post-page>

 */
export declare class BlogPostPage extends HTMLElement {
  content: { header: { nav: ({ label: string; href: string; } | { current: boolean; label: string; href: string; })[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; back: { label: string; href: string; }; date: string; category: string; title: string; byline: string; image: { brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; }; body: ({ kind: "p" | "h2" | "quote"; text: string; } | { kind: "list"; items: string[]; } | { kind: "figure"; caption: string; images: { brand: string; tone: 1 | 2 | 3 | 4; caption?: string; }[]; })[]; related: { title: string; posts: { href: string; title: string; date: string; image: { brand: string; tone: 1 | 2 | 3 | 4; caption: string; } | { brand: string; tone: 1 | 2 | 3 | 4; caption?: undefined; }; }[]; }; offer: { headline: string; note: string; cta: { label: string; href: string; }; }; footer: { domain: string; links: { label: string; href: string; }[]; }; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-blog-post-page': BlogPostPage;
  }
}
