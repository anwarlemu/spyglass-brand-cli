export interface Feature { title: string; body: string }
/**
 * <spyglass-feature-grid-block>

 */
export declare class FeatureGridBlock extends HTMLElement {
  features: Feature[];
  heading?: string | undefined;
  body?: string | undefined;
  columns: 2 | 3;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-feature-grid-block': FeatureGridBlock;
  }
}
