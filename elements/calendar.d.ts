/**
 * <spyglass-calendar>
 * @fires input A day was picked (read `value`).
 * @fires change A day was picked (read `value`).
 * @fires select A day was picked; detail.value is the day.
 */
export declare class Calendar extends HTMLElement {
  value: Date | null;
  label: string;
  min?: Date | null | undefined;
  max?: Date | null | undefined;
  disabled?: ((day: Date) => boolean) | undefined;
  weekStartsOn: 0 | 1;
  locale: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-calendar': Calendar;
  }
}
