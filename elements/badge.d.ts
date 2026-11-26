export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'
export type BadgeDot = 'magenta' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue'
/**
 * <spyglass-badge>
 * @slot (default) The word.
 */
export declare class Badge extends HTMLElement {
  variant: BadgeVariant;
  dot?: BadgeDot | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-badge': Badge;
  }
}
