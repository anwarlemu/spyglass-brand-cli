export interface CreativeItem { src?: string; alt?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }
/**
 * <spyglass-creative-row>

 */
export declare class CreativeRow extends HTMLElement {
  items: CreativeItem[];
  variant: "even" | "peak";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-creative-row': CreativeRow;
  }
}
