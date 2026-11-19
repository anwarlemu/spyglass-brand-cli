export interface CreativeItem { src?: string; alt?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }
/**
 * <spyglass-creative-grid>

 */
export declare class CreativeGrid extends HTMLElement {
  items: CreativeItem[];
  columns: 2 | 3 | 4;
  ratio: string;
  gap: "sm" | "md";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-creative-grid': CreativeGrid;
  }
}
