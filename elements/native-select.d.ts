export type NativeSelectSize = "sm" | "md" | "lg"
/**
 * <spyglass-native-select>
 * @fires change The pick changed (read `value`).
 * @fires input The pick changed (read `value`).
 * @slot (default) The <option>s (copied into the select).
 */
export declare class NativeSelect extends HTMLElement {
  value?: string | undefined;
  name?: string | undefined;
  size: "sm" | "md" | "lg";
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  label?: string | undefined;
  description?: string | undefined;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  formResetCallback(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-native-select': NativeSelect;
  }
}
