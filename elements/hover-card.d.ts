export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
/**
 * <spyglass-hover-card>
 * @slot (default) One link.
 * @slot card What the card shows (an element, or a <template slot="card">).
 */
export declare class HoverCard extends HTMLElement {
  side: Side;
  align: Align;
  width: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-hover-card': HoverCard;
  }
}
