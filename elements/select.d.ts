export interface SelectOption { value: string, label: string, disabled?: boolean }
export type SelectSize = 'sm' | 'md' | 'lg'
/**
 * <spyglass-select>
 * @fires input A row was picked (read `value`).
 * @fires change A row was picked (read `value`).
 */
export declare class Select extends HTMLElement {
  options: SelectOption[];
  value: string;
  placeholder: string;
  size: SelectSize;
  label?: string | undefined;
  name?: string | undefined;
  disabled: boolean;
  invalid: boolean;
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
    'spyglass-select': Select;
  }
}
