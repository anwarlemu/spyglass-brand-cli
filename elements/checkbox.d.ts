/**
 * <spyglass-checkbox>
 * @fires change It was turned (read `checked`).
 * @fires input It was turned (read `checked`).
 * @fires checked-change It was turned; detail.value is the new state.
 * @slot (default) The label (or set `label`).
 */
export declare class Checkbox extends HTMLElement {
  checked: boolean;
  label?: string | undefined;
  hint?: string | undefined;
  indeterminate: boolean;
  disabled: boolean;
  invalid: boolean;
  required: boolean;
  name?: string | undefined;
  value?: string | undefined;
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
    'spyglass-checkbox': Checkbox;
  }
}
