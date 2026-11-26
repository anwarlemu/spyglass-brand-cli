export type ToggleGroupOption = string | { value: string, label: string, disabled?: boolean }
export type ToggleGroupSize = "sm" | "md"
export type ToggleGroupValue = string | string[] | null
/**
 * <spyglass-toggle-group>
 * @fires input A button was pressed (read `value`).
 * @fires change A button was pressed (read `value`).
 */
export declare class ToggleGroup extends HTMLElement {
  options: ToggleGroupOption[];
  label: string;
  multiple: boolean;
  size: "sm" | "md";
  value: ToggleGroupValue;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-toggle-group': ToggleGroup;
  }
}
