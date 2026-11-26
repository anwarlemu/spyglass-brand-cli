/**
 * <spyglass-plan-card>
 * @fires select The button was pressed.
 */
export declare class PlanCard extends HTMLElement {
  heading: string;
  price?: string | undefined;
  features: string[];
  cta?: string | undefined;
  href?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-plan-card': PlanCard;
  }
}
