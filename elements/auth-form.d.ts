export type AuthContent = { signUp: { title: string; lead: string; submit: string; next: string; other: { ask: string; label: string; href: string; }; }; signIn: { title: string; lead: string; submit: string; next: string; other: { ask: string; label: string; href: string; }; }; provider: string; or: string; email: string; placeholder: string; empty: string; invalid: string; working: string; legal: { before: string; terms: { label: string; href: string; }; between: string; privacy: { label: string; href: string; }; after: string; }; proof: string; home: string; }
/**
 * <spyglass-auth-form>
 * @fires provider The provider button pressed (cancelable).
 * @fires email A valid email sent, with { email } (cancelable).
 * @slot provider-icon The provider's mark, 20px.
 */
export declare class AuthForm extends HTMLElement {
  mode: "sign-in" | "sign-up";
  content: { signUp: { title: string; lead: string; submit: string; next: string; other: { ask: string; label: string; href: string; }; }; signIn: { title: string; lead: string; submit: string; next: string; other: { ask: string; label: string; href: string; }; }; provider: string; or: string; email: string; placeholder: string; empty: string; invalid: string; working: string; legal: { before: string; terms: { label: string; href: string; }; between: string; privacy: { label: string; href: string; }; after: string; }; proof: string; home: string; };
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-auth-form': AuthForm;
  }
}
