/**
 * <spyglass-field>
 * @slot (default) The control: <spyglass-input>, <spyglass-textarea>, <spyglass-native-select>, or any input.
 */
export declare class Field extends HTMLElement {
  label: string;
  description?: string | undefined;
  error?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-field': Field;
  }
}
