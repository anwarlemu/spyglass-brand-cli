/**
 * <spyglass-textarea>
 * @fires change When the value is committed.
 * @fires input On every keystroke (read `value`).
 */
export declare class Textarea extends HTMLElement {
  value: string;
  rows: number;
  name?: string | undefined;
  placeholder?: string | undefined;
  maxlength?: number | undefined;
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
    'spyglass-textarea': Textarea;
  }
}
