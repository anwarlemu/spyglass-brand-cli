export interface CreativeItem { src?: string; alt?: string; fit?: ImageFit; position?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
/**
 * <spyglass-creative-grid>

 */
export declare class CreativeGrid extends HTMLElement {
  items: CreativeItem[];
  columns: 4 | 2 | 3;
  ratio: string;
  gap: "sm" | "md";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-creative-grid': CreativeGrid;
  }
}
