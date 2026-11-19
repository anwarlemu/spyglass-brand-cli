/**
 * <spyglass-button-group>
 * @slot (default) The buttons (or a field with its button).
 */
export declare class ButtonGroup extends HTMLElement {
  label?: string | undefined;
  vertical: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-button-group': ButtonGroup;
  }
}
