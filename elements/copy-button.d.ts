/**
 * <spyglass-copy-button>
 * @fires copy After copying; detail.text.
 */
export declare class CopyButton extends HTMLElement {
  text: string;
  label: string;
  copiedLabel: string;
  name: string;
  selectId?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-copy-button': CopyButton;
  }
}
