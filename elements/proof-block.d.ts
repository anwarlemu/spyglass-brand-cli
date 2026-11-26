export interface ProofLogo { name: string; src?: string; ratio?: number; height?: number }
/**
 * <spyglass-proof-block>

 */
export declare class ProofBlock extends HTMLElement {
  heading: string;
  logos: ProofLogo[];
  headId: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-proof-block': ProofBlock;
  }
}
