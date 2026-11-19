export type ToggleVariant = "default" | "outline"
export type ToggleSize = "sm" | "md" | "lg"
/**
 * <spyglass-toggle>
 * @fires pressed-change It was pressed; detail.value is the new state.
 * @slot (default) The label, with a Lucide icon before it if any.
 */
export declare class Toggle extends HTMLElement {
  pressed: boolean;
  disabled: boolean;
  variant: "default" | "outline";
  size: "sm" | "md" | "lg";
  icon: boolean;
  label?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-toggle': Toggle;
  }
}
