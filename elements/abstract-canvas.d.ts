export type AbstractKind = 'archive' | 'tags' | 'graph'
export type Tag = { label: string; value: string };
export type Cluster = { label: string; angle: number; count: number };
export type Moment = "start" | "middle" | "settled";
/**
 * <spyglass-abstract-canvas>

 */
export declare class AbstractCanvas extends HTMLElement {
  kind: AbstractKind;
  tags?: Tag[] | undefined;
  brand?: string | undefined;
  clusters?: Cluster[] | undefined;
  freeze?: Moment | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-abstract-canvas': AbstractCanvas;
  }
}
