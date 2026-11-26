/**
 * <spyglass-logo-strip-block>
 * @slot (default) The marks themselves, instead of the names.
 */
export declare class LogoStripBlock extends HTMLElement {
  names: string[];
  label?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-logo-strip-block': LogoStripBlock;
  }
}
