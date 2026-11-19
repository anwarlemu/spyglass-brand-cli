/**
 * <spyglass-progress>

 */
export declare class Progress extends HTMLElement {
  value?: number | null | undefined;
  max: number;
  label?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-progress': Progress;
  }
}
