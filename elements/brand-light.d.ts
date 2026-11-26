export type LightVariant = 'band' | 'field' | 'corner' | 'strip-left' | 'strip-right' | 'tile' | 'close-up' | 'curved-strip'
export type LightSource = 'brand' | 'generated'
/**
 * <spyglass-brand-light>

 */
export declare class BrandLight extends HTMLElement {
  variant: LightVariant;
  seed: number;
  source: LightSource;
  width?: number | undefined;
  height?: number | undefined;
  ground: boolean;
  cover: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-brand-light': BrandLight;
  }
}
