export type Composition =
  "hero" | "close" | "band" | "frame" | "logo" | "crown" | "works" | "ring" | "horizon" | "wordmark" | "run";
export interface FieldStill { src: string, media: string }
export type DragSource = {
  now: () => number;
  rects: (ms: number, out: Float32Array) => number;
  pace?: () => number;
};
export type RippleSource = {
  ring: (canvas: HTMLCanvasElement) => Ring | null;
  samples: number;
  reach: number;
  slope: number;
  sample: (out: Float32Array) => boolean;
  frozen: () => boolean;
};
export type Ring = { cx: number; cy: number; rx: number; ry: number; cardW: number; cardH: number };
/**
 * <spyglass-dispersion-field>

 */
export declare class DispersionField extends HTMLElement {
  composition: Composition;
  seed: number;
  interactive: boolean;
  still: boolean;
  overlay: boolean;
  stills?: FieldStill[] | undefined;
  drag?: DragSource | undefined;
  ripple?: RippleSource | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-dispersion-field': DispersionField;
  }
}
