export interface RadioOption { value: string, label: string, hint?: string, disabled?: boolean }
/**
 * <spyglass-radio-group>
 * @fires change The pick moved (read `value`).
 * @fires input The pick moved (read `value`).
 */
export declare class RadioGroup extends HTMLElement {
  options: RadioOption[];
  label: string;
  name?: string | undefined;
  inline: boolean;
  disabled: boolean;
  value?: string | undefined;
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
    'spyglass-radio-group': RadioGroup;
  }
}
