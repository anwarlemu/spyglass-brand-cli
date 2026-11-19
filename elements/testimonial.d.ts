/**
 * <spyglass-testimonial>

 */
export declare class Testimonial extends HTMLElement {
  quote: string;
  name: string;
  position?: string | undefined;
  image?: string | undefined;
  arrangement: "stacked" | "side";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-testimonial': Testimonial;
  }
}
