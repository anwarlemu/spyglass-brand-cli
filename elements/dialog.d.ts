/**
 * <spyglass-dialog>
 * @fires open-change It opened or closed (detail.value; read `open`).
 * @fires close It closed (Escape, the scrim, the close button, or open set to false).
 * @slot (default) The body (a form).
 * @slot foot Buttons at the end, under the body.
 */
export declare class Dialog extends HTMLElement {
  heading: string;
  description?: string | undefined;
  wide: boolean;
  locked: boolean;
  open: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-dialog': Dialog;
  }
}
