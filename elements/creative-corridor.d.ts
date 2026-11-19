export interface CreativeItem { src?: string; alt?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }
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
