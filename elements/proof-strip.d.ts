export interface ProofLogo { name: string; src?: string; ratio?: number; height?: number }
/**
 * <spyglass-proof-strip>

 */
export declare class ProofStrip extends HTMLElement {
  logos: ProofLogo[];
  tight: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-proof-strip': ProofStrip;
  }
}
