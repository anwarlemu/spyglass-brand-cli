/**
 * <spyglass-carousel>
 * @slot (default) The slides: each child element is one.
 */
export declare class Carousel extends HTMLElement {
  label: string;
  perView: 1 | 2 | 3;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-carousel': Carousel;
  }
}
