/**
 * <spyglass-newsletter-block>
 * @fires subscribe With { email }.
 */
export declare class NewsletterBlock extends HTMLElement {
  heading: string;
  body?: string | undefined;
  placeholder: string;
  cta: string;
  note?: string | undefined;
  done: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-newsletter-block': NewsletterBlock;
  }
}
