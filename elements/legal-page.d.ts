export type LegalContent = { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; title: string; updated: string; sections: { id: string; title: string; body: string[]; }[]; contents: string; footer: { domain: string; links: { label: string; href: string; }[]; }; }
/**
 * <spyglass-legal-page>

 */
export declare class LegalPage extends HTMLElement {
  content: { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; title: string; updated: string; sections: { id: string; title: string; body: string[]; }[]; contents: string; footer: { domain: string; links: { label: string; href: string; }[]; }; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-legal-page': LegalPage;
  }
}
