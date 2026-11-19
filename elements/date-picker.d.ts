/**
 * <spyglass-date-picker>
 * @fires input A day was picked (read `value`).
 * @fires change A day was picked (read `value`).
 */
export declare class DatePicker extends HTMLElement {
  value: Date | null;
  name?: string | undefined;
  placeholder: string;
  min?: Date | null | undefined;
  max?: Date | null | undefined;
  disabled?: ((day: Date) => boolean) | undefined;
  invalid: boolean;
  required: boolean;
  locale: string;
  format: Intl.DateTimeFormatOptions;
  label?: string | undefined;
  description?: string | undefined;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  syncValidity(): void;
  formResetCallback(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-date-picker': DatePicker;
  }
}
