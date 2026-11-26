export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
/**
 * <spyglass-popover>
 * @fires open-change It opened or closed (detail.value).
 * @slot (default) The panel's content.
 * @slot trigger A <button> to use as the trigger, or the default trigger's content.
 */
export declare class Popover extends HTMLElement {
  label: string;
  side: Side;
  align: Align;
  width: string;
  triggerLabel?: string | undefined;
  open: boolean;
  close(refocus?: boolean): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-popover': Popover;
  }
}
