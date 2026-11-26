/**
 * <spyglass-card>
 * @slot (default) The body.
 * @slot actions Buttons or links at the foot.
 */
export declare class Card extends HTMLElement {
  heading?: string | undefined;
  description?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-card': Card;
  }
}
