export interface CommandGroup { heading?: string, items: CommandItem[] }
export interface CommandItem { id: string, label: string, keywords?: string[], shortcut?: string, disabled?: boolean }
/**
 * <spyglass-command>
 * @fires select A row was run (detail: the row).
 * @slot icon-<id> The icon of the row with that id (a 16px Lucide icon).
 */
export declare class Command extends HTMLElement {
  groups: CommandGroup[];
  label: string;
  placeholder: string;
  empty: string;
  autoFocus: boolean;
  focus(options?: FocusOptions | undefined): void;
  reset(): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-command': Command;
  }
}
