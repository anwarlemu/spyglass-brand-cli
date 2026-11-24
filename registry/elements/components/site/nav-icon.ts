import { html, svg } from 'lit'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { DsElement, define } from '@/elements/lib/element'
import { CHEVRON_PATH, navIconPaths, type NavIconName } from '@/lib/site-header'
import styles from 'virtual:tw'

// NavIcon.tsx as <spyglass-nav-icon name size>: the site's two-tone menu glyphs. The header renders the same markup
// through `navIcon()` and `chevron()`, so its menus live in one shadow root.

export const navIcon = (name: NavIconName, size: 20 | 24 = 20, cls = '') => html`<svg data-ds="nav-icon" viewBox="0 0 24 24" width=${size} height=${size} aria-hidden="true" focusable="false" class=${`block flex-none ${cls}`.trim()}>${svg`${unsafeSVG(navIconPaths(name))}`}</svg>`
export const navIconStyles = styles
export const chevron = (size: 12 | 16 = 12, cls = '') => html`<svg viewBox="0 0 12 12" width=${size} height=${size} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class=${`flex-none ${cls}`.trim()}>${svg`${unsafeSVG(CHEVRON_PATH)}`}</svg>`

/** @summary A two-tone menu glyph. */
export class NavIcon extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { name: {}, size: { type: Number } }
	name: NavIconName = 'soon'
	/** 20 or 24px. */
	size: 20 | 24 = 20

	render() {
		return navIcon(this.name, this.size)
	}
}

define('nav-icon', NavIcon)
