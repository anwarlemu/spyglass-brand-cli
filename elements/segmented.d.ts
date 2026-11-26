export interface SegmentedOption { key: string; label: string }
/**
 * <spyglass-segmented>
 * @fires input The choice changed (read `value`).
 * @fires change The choice changed (read `value`).
 */
export declare class Segmented extends HTMLElement {
  options: SegmentedOption[];
  label: string;
  value?: string | undefined;
  block: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-segmented': Segmented;
  }
}
