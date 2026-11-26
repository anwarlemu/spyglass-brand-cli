export interface AsciiRect { x: number; y: number; w: number; h: number }
/**
 * <spyglass-ascii-texture>

 */
export declare class AsciiTexture extends HTMLElement {
  seed: number;
  density: number;
  width: number;
  height: number;
  clear: AsciiRect[];
  cover: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-ascii-texture': AsciiTexture;
  }
}
