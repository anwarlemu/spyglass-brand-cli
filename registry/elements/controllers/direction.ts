import type { ReactiveController, ReactiveControllerHost } from 'lit'
import { tagName } from '@/elements/lib/element'

// useDirection for elements: the reading direction of the closest <spyglass-direction> around the host (through shadow
// roots), or `ltr` outside any. An element that flips what it draws reads `controller.dir`; it renders again when the
// wrapper's direction changes (the wrapper fires `direction-change`).
export type Dir = 'ltr' | 'rtl'

/** The closest direction wrapper around `node` in the flat tree, if any. */
export function directionOf(node: Node): Dir {
	let n: Node | null = node
	while (n) {
		if (n instanceof Element && n.localName === tagName('direction')) return n.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr'
		n = (n as Element).assignedSlot ?? n.parentNode ?? (n as ShadowRoot).host ?? null
	}
	return 'ltr'
}

export class DirectionController implements ReactiveController {
	dir: Dir = 'ltr'
	constructor(private host: ReactiveControllerHost & HTMLElement) {
		host.addController(this)
	}
	private sync = () => {
		const next = directionOf(this.host)
		if (next !== this.dir) {
			this.dir = next
			this.host.requestUpdate()
		}
	}
	hostConnected() {
		this.dir = directionOf(this.host)
		document.addEventListener('direction-change', this.sync)
	}
	hostDisconnected() {
		document.removeEventListener('direction-change', this.sync)
	}
}
