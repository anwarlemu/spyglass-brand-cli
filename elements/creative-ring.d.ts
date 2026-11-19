export interface CreativeItem { src?: string; alt?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }
/**
 * <spyglass-creative-ring>
 * @slot (default) What sits in the middle (the lockup).
 */
export declare class CreativeRing extends HTMLElement {
  items: CreativeItem[];
  seed: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-creative-ring': CreativeRing;
  }
}
