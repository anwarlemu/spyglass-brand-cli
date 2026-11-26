export type HeroPlacement = 'left' | 'center' | 'right'
export type HeroLight = 'field' | 'corner' | 'band' | 'strip' | 'none'
/**
 * <spyglass-hero-block>
 * @slot (default) The media under the copy.
 * @slot headline The headline with inline creatives (instead of the attribute).
 * @slot actions Buttons.
 */
export declare class HeroBlock extends HTMLElement {
  headline: string;
  body?: string | undefined;
  eyebrow?: string | undefined;
  placement: HeroPlacement;
  light: HeroLight;
  seed: number;
  texture: boolean;
  size: "section" | "display";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-hero-block': HeroBlock;
  }
}
