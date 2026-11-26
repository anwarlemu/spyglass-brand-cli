export type LightArtName = 'hero-band' | 'pricing'
/**
 * <spyglass-light-image>

 */
export declare class LightImage extends HTMLElement {
  art: LightArtName;
  picture?: string | undefined;
  mask?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
  split?: number | undefined;
  grain: boolean;
  still: boolean;
  priority: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-light-image': LightImage;
  }
}
