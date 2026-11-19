/**
 * <spyglass-alert-dialog>
 * @fires confirm The action was chosen.
 * @fires cancel Cancel was chosen, or Escape pressed.
 * @fires open-change It opened or closed (detail.value).
 * @slot (default) More about what happens, under the line.
 */
export declare class AlertDialog extends HTMLElement {
  heading: string;
  description: string;
  action: string;
  cancel: string;
  danger: boolean;
  open: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-alert-dialog': AlertDialog;
  }
}
