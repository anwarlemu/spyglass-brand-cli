export type TabOption = string | { value: string, label: string, disabled?: boolean }
/**
 * <spyglass-tabs>
 * @fires input The tab changed (read `value`).
 * @fires change The tab changed (read `value`).
 * @slot <value> The panel for the tab with that value.
 */
export declare class Tabs extends HTMLElement {
  value: string;
  options: TabOption[];
  label: string;
  variant: "default" | "line";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-tabs': Tabs;
  }
}
