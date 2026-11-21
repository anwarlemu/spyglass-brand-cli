// Vue's <Transition> classes for elements, so a Vue item's CSS (.ds-pop-enter-from, .ds-toast-leave-active,
// .ds-toast-move) works unchanged inside a shadow root.
//
//   await enter(el, 'ds-pop')        <name>-enter-from and -enter-active, then -enter-to, until it ends
//   await leave(el, 'ds-pop')        the same with -leave-*; remove or hide the element after
//   const rects = measure(nodes); ...render...; move(nodes, rects, 'ds-toast')   a group's FLIP move (<name>-move)
//
// `duration` is Vue's explicit duration in ms, a number or { enter, leave }.
type Duration = number | { enter: number, leave: number }
type Phase = 'enter' | 'leave'

export function runTransition(el: Element, name: string, phase: Phase, duration?: Duration): Promise<void> {
	const from = `${name}-${phase}-from`
	const active = `${name}-${phase}-active`
	const to = `${name}-${phase}-to`
	el.classList.add(from, active)
	return new Promise((resolve) => {
		let done = false
		const finish = () => {
			if (done) return
			done = true
			el.classList.remove(from, active, to)
			el.removeEventListener('transitionend', onEnd)
			el.removeEventListener('animationend', onEnd)
			resolve()
		}
		const onEnd = (event: Event) => {
			if (event.target === el) finish()
		}
		requestAnimationFrame(() => requestAnimationFrame(() => {
			el.classList.remove(from)
			el.classList.add(to)
			const explicit = duration === undefined ? undefined : typeof duration === 'number' ? duration : duration[phase]
			if (explicit !== undefined) return void setTimeout(finish, explicit)
			// A scroll-linked animation (the scroll fade: duration auto) is not timed, so it counts as none.
			const cs = getComputedStyle(el)
			const longest = (durations: string, delays: string) => {
				const d = durations.split(',').map((s) => (Number.parseFloat(s) || 0) * (s.trim().endsWith('ms') ? 1 : 1000))
				const l = delays.split(',').map((s) => (Number.parseFloat(s) || 0) * (s.trim().endsWith('ms') ? 1 : 1000))
				return Math.max(0, ...d.map((x, i) => x + (l[i % l.length] || 0)))
			}
			const total = Math.max(longest(cs.transitionDuration, cs.transitionDelay), longest(cs.animationDuration, cs.animationDelay))
			if (!total) return finish()
			el.addEventListener('transitionend', onEnd)
			el.addEventListener('animationend', onEnd)
			setTimeout(finish, total + 50)
		}))
	})
}
export const enter = (el: Element, name: string, duration?: Duration) => runTransition(el, name, 'enter', duration)
export const leave = (el: Element, name: string, duration?: Duration) => runTransition(el, name, 'leave', duration)

/** Where each node is, before a render moves them. */
export function measure(nodes: Iterable<[unknown, Element]>) {
	const out = new Map<unknown, DOMRect>()
	for (const [key, node] of nodes) out.set(key, node.getBoundingClientRect())
	return out
}
/** After the render: each node that moved slides from where it was (FLIP), with <name>-move setting the transition. */
export function move(nodes: Iterable<[unknown, HTMLElement]>, before: Map<unknown, DOMRect>, name: string) {
	for (const [key, node] of nodes) {
		const was = before.get(key)
		if (!was || node.classList.contains(`${name}-leave-active`) || node.classList.contains(`${name}-enter-active`)) continue
		const now = node.getBoundingClientRect()
		if (was.left === now.left && was.top === now.top) continue
		node.style.transitionDuration = '0s'
		node.style.transform = `translate(${was.left - now.left}px, ${was.top - now.top}px)`
		void node.offsetWidth
		node.classList.add(`${name}-move`)
		node.style.transitionDuration = ''
		node.style.transform = ''
		const end = () => {
			node.classList.remove(`${name}-move`)
			node.removeEventListener('transitionend', end)
		}
		node.addEventListener('transitionend', end)
	}
}
