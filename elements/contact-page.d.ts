export type ContactContent = { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; headline: string; body: string; form: { label: string; action: string; name: { label: string; placeholder: string; }; email: { label: string; placeholder: string; description: string; }; message: { label: string; placeholder: string; }; submit: string; }; footer: { domain: string; links: { label: string; href: string; }[]; }; }
/**
 * <spyglass-contact-page>
 * @fires send On submit, with { name, email, message }; preventDefault() keeps the form from posting.
 */
export declare class ContactPage extends HTMLElement {
  content: { header: { nav: { label: string; href: string; }[]; secondary: { label: string; href: string; }; cta: { label: string; href: string; }; }; headline: string; body: string; form: { label: string; action: string; name: { label: string; placeholder: string; }; email: { label: string; placeholder: string; description: string; }; message: { label: string; placeholder: string; }; submit: string; }; footer: { domain: string; links: { label: string; href: string; }[]; }; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-contact-page': ContactPage;
  }
}
