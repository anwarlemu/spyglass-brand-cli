/**
 * <spyglass-input-otp>
 * @fires change When the value is committed.
 * @fires input On every keystroke (read `value`).
 * @fires complete Every cell is filled; detail.value is the code.
 */
export declare class InputOtp extends HTMLElement {
  value: string;
  length: number;
  split?: number | undefined;
  label: string;
  numeric: boolean;
  invalid: boolean;
  disabled: boolean;
  name?: string | undefined;
  required: boolean;
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
    'spyglass-input-otp': InputOtp;
  }
}
