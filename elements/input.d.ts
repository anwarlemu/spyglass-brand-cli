export type InputSize = "sm" | "md" | "lg"
/**
 * <spyglass-input>
 * @fires change When the value is committed.
 * @fires input On every keystroke (read `value`).
 */
export declare class Input extends HTMLElement {
  value: string;
  type: string;
  name?: string | undefined;
  placeholder?: string | undefined;
  autocomplete?: string | undefined;
  size: "sm" | "md" | "lg";
  disabled: boolean;
  readonly: boolean;
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
    'spyglass-input': Input;
  }
}
