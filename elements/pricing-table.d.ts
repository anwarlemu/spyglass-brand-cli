export interface PricingPlan { name: string; description?: string; price: string; unit?: string; yearly?: { price: string; unit?: string }; tag?: string; badge?: string; featured?: boolean; light?: PlanLight; rim?: boolean; cta?: string; href?: string; ladder?: string; features?: string[] }
export type PlanLight = 'free' | 'creator' | 'pro' | 'enterprise'
export type Billing = 'monthly' | 'yearly'
/**
 * <spyglass-pricing-table>
 * @fires billing-change The switch moved ({ value }).
 */
export declare class PricingTable extends HTMLElement {
  plans: PricingPlan[];
  billing?: { label?: string; monthly?: string; yearly?: string; } | undefined;
  note?: { lead: string; rest?: string; } | undefined;
  value: Billing;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-pricing-table': PricingTable;
  }
}
