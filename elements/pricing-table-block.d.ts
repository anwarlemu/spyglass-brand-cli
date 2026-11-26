export interface Plan { title: string; price?: string; features?: string[]; cta?: string; href?: string }
/**
 * <spyglass-pricing-table-block>

 */
export declare class PricingTableBlock extends HTMLElement {
  plans: Plan[];
  heading?: string | undefined;
  body?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-pricing-table-block': PricingTableBlock;
  }
}
