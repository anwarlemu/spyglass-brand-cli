/**
 * <spyglass-drawer>
 * @fires open-change It opened or closed (detail.value; read `open`).
 * @slot (default) The panel's body.
 */
export declare class Drawer extends HTMLElement {
  heading: string;
  description?: string | undefined;
  side: "right" | "bottom" | "left";
  open: boolean;
  close(): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-drawer': Drawer;
  }
}
