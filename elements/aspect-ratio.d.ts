/**
 * <spyglass-aspect-ratio>
 * @slot (default) What fills it (position it absolutely to fill the box).
 */
export declare class AspectRatio extends HTMLElement {
  ratio: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-aspect-ratio': AspectRatio;
  }
}
