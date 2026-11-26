export type LogoVariant = 'mark' | 'wordmark' | 'horizontal' | 'vertical' | 'mark-3d' | 'horizontal-3d' | 'vertical-3d'
export type LogoTone = 'auto' | 'white' | 'black'
/**
 * <spyglass-logo>

 */
export declare class Logo extends HTMLElement {
  variant: LogoVariant;
  tone: LogoTone;
  height: number;
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-logo': Logo;
  }
}
