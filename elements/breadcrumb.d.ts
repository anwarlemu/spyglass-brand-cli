export interface Crumb { label: string, href?: string }
/**
 * <spyglass-breadcrumb>
 * @fires navigate A step back was clicked (detail.crumb, detail.event).
 */
export declare class Breadcrumb extends HTMLElement {
  items: Crumb[];
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-breadcrumb': Breadcrumb;
  }
}
