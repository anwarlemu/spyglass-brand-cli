/**
 * <spyglass-testimonial-block>

 */
export declare class TestimonialBlock extends HTMLElement {
  quote: string;
  name: string;
  position?: string | undefined;
  image?: string | undefined;
  label?: string | undefined;
  arrangement: "stacked" | "side";
  card: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-testimonial-block': TestimonialBlock;
  }
}
