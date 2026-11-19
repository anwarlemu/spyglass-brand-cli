/**
 * <spyglass-switch>
 * @fires input It was turned (read `checked`).
 * @fires change It was turned (read `checked`).
 */
export declare class Switch extends HTMLElement {
  checked: boolean;
  label: string;
  disabled: boolean;
  name?: string | undefined;
  required: boolean;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  syncValidity(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-switch': Switch;
  }
}
