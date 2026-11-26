export type ProductPricingVariant = 'receipt' | 'open' | 'plans' | 'rate'
export interface ProductPricingAction { label: string; href: string }
export interface ReceiptRow { name: string; meta: string; picture?: string | ImageSlot }
export interface ImageSlot {
	/** The image. */
	src?: string
	/** What it shows; empty when it is decoration. */
	alt?: string
	/** How it fills its box (object-fit); cover by default. */
	fit?: ImageFit
	/** Where it is anchored in its box (object-position), for example "50% 20%" or "top". */
	position?: string
}
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
export interface PricingPlanLine { name: string; price: string; unit?: string; credits?: string; after?: string }
/**
 * <spyglass-product-pricing>

 */
export declare class ProductPricing extends HTMLElement {
  variant: ProductPricingVariant;
  value: string;
  unit: string;
  headline?: string | undefined;
  lead?: string | undefined;
  note: string;
  primary?: ProductPricingAction | undefined;
  secondary?: ProductPricingAction | undefined;
  product: string;
  rows: ReceiptRow[];
  free: ReceiptRow;
  tally: string;
  freeMonthly: number;
  freeRows: { label: string; value: string; }[];
  example?: string | undefined;
  plans: PricingPlanLine[];
  noun: string;
  missing: string;
  prefix: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-product-pricing': ProductPricing;
  }
}
