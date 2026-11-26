export interface PageAction { label: string; href: string }
/**
 * <spyglass-page-head>
 * @slot control A control in the White button's place (a connect menu, a form).
 * @slot visual Your own picture in the right columns instead of the drift (margin only).
 */
export declare class PageHead extends HTMLElement {
  headId: string;
  lines: string[];
  eyebrow?: string | undefined;
  lead?: string | undefined;
  primary?: PageAction | undefined;
  secondary?: PageAction | undefined;
  align: "centre" | "margin";
  drift: boolean;
  pair: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-page-head': PageHead;
  }
}
