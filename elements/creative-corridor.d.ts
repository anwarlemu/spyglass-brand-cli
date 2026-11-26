export interface CreativeItem { src?: string; alt?: string; fit?: ImageFit; position?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
/**
 * <spyglass-creative-corridor>

 */
export declare class CreativeCorridor extends HTMLElement {
  items: CreativeItem[];
  seed: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-creative-corridor': CreativeCorridor;
  }
}
