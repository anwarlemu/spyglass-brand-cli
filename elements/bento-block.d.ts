export interface BentoItem { title: string; body?: string; image?: string; span?: 'normal' | 'wide' | 'tall' }
/**
 * <spyglass-bento-block>

 */
export declare class BentoBlock extends HTMLElement {
  items: BentoItem[];
  heading?: string | undefined;
  body?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-bento-block': BentoBlock;
  }
}
