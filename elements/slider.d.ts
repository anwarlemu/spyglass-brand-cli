/**
 * <spyglass-slider>
 * @fires change When it is let go (read `value`).
 * @fires input While it moves (read `value`).
 */
export declare class Slider extends HTMLElement {
  value: number;
  label: string;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  valueText?: string | undefined;
  name?: string | undefined;
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
    'spyglass-slider': Slider;
  }
}
