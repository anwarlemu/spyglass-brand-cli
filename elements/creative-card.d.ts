export type CreativeRatio = '4/5' | '1/1' | '3/4' | '7/5' | '3/5' | '9/16' | '16/9' | 'fill'
export type CreativeTone = 1 | 2 | 3 | 4
/**
 * <spyglass-creative-card>

 */
export declare class CreativeCard extends HTMLElement {
  src?: string | undefined;
  alt: string;
  ratio: CreativeRatio;
  brand?: string | undefined;
  caption?: string | undefined;
  tone: CreativeTone;
  href?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-creative-card': CreativeCard;
  }
}
