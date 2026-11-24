// The site's button glow (ButtonGlow.tsx): under a mouse, a White glow follows the pointer inside a button. The button
// draws it (a radial gradient at --glow-x, --glow-y, faded in on hover over the brand's enter step); this only keeps
// the position current, once a frame, for a fine pointer. Touch and pens never set it.
const frames = new WeakMap<HTMLElement, number>()

export function followGlow(el: HTMLElement | null, event: { clientX: number; clientY: number; pointerType: string }) {
	if (!el || event.pointerType !== 'mouse') return
	if (frames.has(el)) cancelAnimationFrame(frames.get(el)!)
	const { clientX, clientY } = event
	frames.set(el, requestAnimationFrame(() => {
		frames.delete(el)
		const box = el.getBoundingClientRect()
		el.style.setProperty('--glow-x', `${clientX - box.left}px`)
		el.style.setProperty('--glow-y', `${clientY - box.top}px`)
	}))
}
