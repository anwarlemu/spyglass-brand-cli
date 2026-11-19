export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
/**
 * <spyglass-button>
 * @fires click When pressed (the native click, from the inner button).
 * @slot (default) The label, with a Lucide icon beside it if any.
 */
export declare class Button extends HTMLElement {
  variant: ButtonVariant;
  size: ButtonSize;
  icon: boolean;
  href?: string | undefined;
  type: "button" | "submit" | "reset";
  disabled: boolean;
  label?: string | undefined;
  description?: string | undefined;
  expanded?: string | undefined;
  haspopup?: string | undefined;
  controls?: string | undefined;
  rootName: string;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-button': Button;
  }
}
