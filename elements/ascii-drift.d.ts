export type AsciiDriftCrop = 'mass' | 'column' | 'cluster' | 'scatter'
export type AsciiDriftFrom = 'centre' | 'left' | 'right' | 'top' | 'bottom'
export type AsciiDriftStrength = 'quiet' | 'faint' | 'hero'
/**
 * <spyglass-ascii-drift>

 */
export declare class AsciiDrift extends HTMLElement {
  crop: AsciiDriftCrop;
  from: AsciiDriftFrom;
  strength: AsciiDriftStrength;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-ascii-drift': AsciiDrift;
  }
}
