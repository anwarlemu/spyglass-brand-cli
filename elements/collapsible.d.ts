/**
 * <spyglass-collapsible>
 * @fires open-change It opened or closed (detail.value).
 * @slot (default) What opens.
 * @slot trigger The trigger's content, or a <button> to use as the trigger.
 */
export declare class Collapsible extends HTMLElement {
  open: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-collapsible': Collapsible;
  }
}
