export type CursorMode = 'trail' | 'lens' | 'burst' | 'off'
/**
 * <spyglass-cursor-effects>

 */
export declare class CursorEffects extends HTMLElement {
  mode: CursorMode;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-cursor-effects': CursorEffects;
  }
}
