/**
 * <spyglass-offer-block>
 * @slot (default) A plan card, instead of the terms and the button.
 */
export declare class OfferBlock extends HTMLElement {
  headline: string;
  note?: string | undefined;
  cta?: { label: string; href?: string; } | undefined;
  light: "field" | "corner";
  seed: number;
  texture: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-offer-block': OfferBlock;
  }
}
