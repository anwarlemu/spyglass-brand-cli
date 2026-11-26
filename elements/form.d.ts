export type Validatable = HTMLElement & { checkValidity(): boolean, reportValidity(): boolean, validity: ValidityState, willValidate: boolean }
/**
 * <spyglass-form>
 * @fires submit It was sent (a submit button or Enter in a field).
 * @fires reset A reset button was pressed.
 * @slot (default) The fields.
 * @slot actions The buttons at the end, the main one last.
 */
export declare class Form extends HTMLElement {
  failure?: string | undefined;
  label?: string | undefined;
  fields: Validatable[];
  send(): Promise<void>;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-form': Form;
  }
}
