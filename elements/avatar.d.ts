export type AvatarSize = 'sm' | 'md' | 'lg'
/**
 * <spyglass-avatar>

 */
export declare class Avatar extends HTMLElement {
  name?: string | undefined;
  src?: string | undefined;
  size: AvatarSize;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-avatar': Avatar;
  }
}
