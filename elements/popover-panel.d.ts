export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
/**
 * <spyglass-popover-panel>
 * @fires open-change It opened or closed (detail.value).
 * @slot (default) The panel's content.
 */
export declare class PopoverPanel extends HTMLElement {
  anchor: string;
  side: Side;
  align: Align;
  tip: boolean;
  open: boolean;
  sticky: boolean;
  matchWidth: boolean;
  show(keyboard?: boolean): Promise<void>;
  hide(refocus?: boolean, keyboard?: boolean): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-popover-panel': PopoverPanel;
  }
}
