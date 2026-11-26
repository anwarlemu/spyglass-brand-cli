export type TextVariant = 'display' | 'hero' | 'h1' | 'h2' | 'h3' | 'h4' | 'lead' | 'large' | 'p' | 'ui' | 'small' | 'muted' | 'caption' | 'label' | 'blockquote' | 'code'
/**
 * <spyglass-text>
 * @slot (default) The text.
 */
export declare class Text extends HTMLElement {
  variant: TextVariant;
  as?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-text': Text;
  }
}
