export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
/**
 * <spyglass-skeleton>

 */
export declare class Skeleton extends HTMLElement {
  circle: boolean;
  src?: string | undefined;
  alt: string;
  fit?: ImageFit | undefined;
  position?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-skeleton': Skeleton;
  }
}
