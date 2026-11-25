// The site's home link (site/Header/HomeLink): pressed on the page it points to, it does not reload. The page jumps to
// the top at once (no smooth scroll: it is a reset, not a journey), any #hash is dropped from the address, and focus
// goes to the header's home link so the next Tab starts from the top. A press with a modifier key keeps the browser's
// own behavior (a new tab or window). Both flavors call it from the link's click.
export function homeLinkClick(event: MouseEvent) {
	if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
	const link = event.currentTarget as HTMLAnchorElement | null
	if (!link?.href) return
	const target = new URL(link.href, window.location.href)
	if (target.origin !== window.location.origin || target.pathname !== window.location.pathname) return
	event.preventDefault()
	window.scrollTo({ top: 0, behavior: 'instant' })
	if (window.location.hash) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
	// The first home link on the page (the header's), even from inside a shadow root.
	const root = link.getRootNode() as Document | ShadowRoot
	const first = (root.querySelector?.('[data-home-link]') ?? document.querySelector('[data-home-link]')) as HTMLElement | null
	if (first && first !== link) first.focus({ preventScroll: true })
}
