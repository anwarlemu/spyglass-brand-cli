import type { ReactiveController, ReactiveControllerHost } from 'lit'
import { tagName } from './element'

// Menu rows for elements that draw a menu of their own (menu, context menu, menubar, and any panel of
// <conare-menu-item> rows): the rows, the keys over them (Vue's onMenuRows), and closing on a chosen row.
//
//   rows = () => menuRows(this)                       the enabled <conare-menu-item>s inside the host's light DOM
//   @keydown=${(e) => onMenuRows(e, rows(), (refocus) => this.pop.hide(refocus))}
//   new CloseOnSelect(this, () => this.pop.hide(true))

type Row = HTMLElement & { disabled?: boolean, keepOpen?: boolean }

/** The enabled menu rows under `root` (in its light DOM, or in a shadow root passed as root), in order; `slot` keeps
 * those in one named slot (slot="menu"). */
export function menuRows(root: ParentNode, slot?: string): Row[] {
	const sel = slot ? `${tagName('menu-item')}[slot="${slot}"]` : tagName('menu-item')
	return [...root.querySelectorAll<Row>(sel)].filter((r) => !r.disabled)
}

/** Arrow, Home and End keys over a menu's rows; Tab closes without moving focus back (Vue's onMenuRows). Returns
 * whether it handled the key. */
export function onMenuRows(event: KeyboardEvent, rows: HTMLElement[], close: (refocus: boolean) => void) {
	const at = rows.findIndex((r) => r.matches(':focus-within'))
	if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
		event.preventDefault()
		const step = event.key === 'ArrowDown' ? 1 : -1
		rows[(at + step + rows.length) % rows.length]?.focus()
	} else if (event.key === 'Home' || event.key === 'End') {
		event.preventDefault()
		;(event.key === 'Home' ? rows[0] : rows.at(-1))?.focus()
	} else if (event.key === 'Tab') close(false)
	else return false
	return true
}

// A chosen row's `select` reaches every menu around it; the innermost closes, once.
const closed = new WeakSet<Event>()

/** Closes the host's menu when one of its rows is chosen (a row's `select`, unless the row is keep-open), as Vue's
 * MenuItem closes the menu it is provided by. */
export class CloseOnSelect implements ReactiveController {
	constructor(private host: ReactiveControllerHost & HTMLElement, private close: () => void) {
		host.addController(this)
	}
	private onSelect = (event: Event) => {
		const row = event.composedPath()[0] as Row
		if (closed.has(event) || row?.localName !== tagName('menu-item')) return
		closed.add(event)
		if (!row.keepOpen) this.close()
	}
	hostConnected() {
		this.host.addEventListener('select', this.onSelect)
	}
	hostDisconnected() {
		this.host.removeEventListener('select', this.onSelect)
	}
}
