export interface Step { title: string; body?: string }
/**
 * <spyglass-steps-block>

 */
export declare class StepsBlock extends HTMLElement {
  steps: Step[];
  heading?: string | undefined;
  body?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-steps-block': StepsBlock;
  }
}
