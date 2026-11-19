export interface CommandGroup { heading?: string, items: CommandItem[] }
export interface CommandItem { id: string, label: string, keywords?: string[], shortcut?: string, disabled?: boolean }
/**
 * <spyglass-command-dialog>
 * @fires select A row was run (detail: the row), from the inner command menu.
 * @fires open-change It opened or closed (detail.value).
 * @slot icon-<id> The icon of the row with that id.
 */
export declare class CommandDialog extends HTMLElement {
  groups: CommandGroup[];
  label: string;
  placeholder: string;
  empty: string;
  shortcut: string;
  open: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-command-dialog': CommandDialog;
  }
}
