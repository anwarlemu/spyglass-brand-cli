export interface Stat { value: string; label: string }
/**
 * <spyglass-stat-block>

 */
export declare class StatBlock extends HTMLElement {
  stats: Stat[];
  heading?: string | undefined;
  variant: "rule" | "card";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-stat-block': StatBlock;
  }
}
