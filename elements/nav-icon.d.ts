export type NavIconName =
	| 'brand' | 'creator' | 'media' | 'insights' | 'landing' | 'collabs' | 'comments' | 'tagged' | 'soon' | 'paid' | 'organic'
	| 'creators' | 'monitor' | 'trend' | 'build' | 'research' | 'templates' | 'docs' | 'blog' | 'articles' | 'demos' | 'careers'
/**
 * <spyglass-nav-icon>

 */
export declare class NavIcon extends HTMLElement {
  name: NavIconName;
  size: 24 | 20;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-nav-icon': NavIcon;
  }
}
