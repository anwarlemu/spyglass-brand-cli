/**
 * <spyglass-search-bar>
 * @fires search Enter or the button: detail.query is the text.
 * @fires input On every keystroke (read `value`).
 */
export declare class SearchBar extends HTMLElement {
  value: string;
  placeholder: string;
  buttonLabel: string;
  label: string;
  name: string;
  disabled: boolean;
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
    'spyglass-search-bar': SearchBar;
  }
}
