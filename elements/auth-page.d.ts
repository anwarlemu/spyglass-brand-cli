export type AuthContent = { signUp: { title: string; lead: string; submit: string; next: string; other: { ask: string; label: string; href: string; }; }; signIn: { title: string; lead: string; submit: string; next: string; other: { ask: string; label: string; href: string; }; }; provider: string; or: string; email: string; placeholder: string; empty: string; invalid: string; working: string; legal: { before: string; terms: { label: string; href: string; }; between: string; privacy: { label: string; href: string; }; after: string; }; proof: string; home: string; }
export interface ProofLogo { name: string; src?: string; ratio?: number; height?: number }
export type AuthSection = "form" | "proof"
/**
 * <spyglass-auth-page>
 * @slot provider-icon The provider's mark, 20px.
 */
export declare class AuthPage extends HTMLElement {
  mode: "sign-in" | "sign-up";
  content: { signUp: { title: string; lead: string; submit: string; next: string; other: { ask: string; label: string; href: string; }; }; signIn: { title: string; lead: string; submit: string; next: string; other: { ask: string; label: string; href: string; }; }; provider: string; or: string; email: string; placeholder: string; empty: string; invalid: string; working: string; legal: { before: string; terms: { label: string; href: string; }; between: string; privacy: { label: string; href: string; }; after: string; }; proof: string; home: string; };
  logos: ProofLogo[];
  proof?: boolean | undefined;
  sections?: ("form" | "proof")[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-auth-page': AuthPage;
  }
}
