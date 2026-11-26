export type ProductVisualKind =
	| 'brand-record'
	| 'creative-record'
	| 'page-record'
	| 'creator-record'
	| 'tagged-record'
	| 'comment-thread'
	| 'add-account'
	| 'add-creator'
	| 'comment-themes'
	| 'creator-filters'
	| 'filter-narrow'
	| 'posts-narrow'
	| 'collabs-timeline'
	| 'tagged-timeline'
	| 'media-mix'
	| 'campaigns'
	| 'pages-switch'
	| 'links-board'
	| 'patterns-switch'
/**
 * <spyglass-product-visual>

 */
export declare class ProductVisual extends HTMLElement {
  kind: ProductVisualKind;
  data: unknown;
  texture?: string | number | undefined;
  fill: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-product-visual': ProductVisual;
  }
}
