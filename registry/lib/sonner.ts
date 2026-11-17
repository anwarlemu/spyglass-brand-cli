// The toasts' store for the sonner item, framework-free so both flavors share its behavior: toast() adds a note,
// toast.dismiss() takes one (or all) away, and a Toaster subscribes and draws them. Three at most: a fourth pushes the
// oldest out. The same title and description again restarts that note's time instead of stacking a copy. The time
// itself is the Toaster's, so it can stop while a note is pointed at or the tab is hidden.
export interface ToastAction {
	/** The button's label. */
	label: string
	/** What it does; the toast closes after it. */
	onClick?: () => void
}
export interface ToastOptions {
	/** A line under the title. */
	description?: string
	/** One button beside the text. */
	action?: ToastAction
	/** How long it stays, in ms (4000 by default). */
	duration?: number
}
export interface ToastData extends ToastOptions {
	id: number
	title: string
	duration: number
	/** Bumped when the same note is shown again, so its time restarts. */
	shown: number
}

export const TOAST_MS = 4000
export const TOAST_MOST = 3

let toasts: ToastData[] = []
let last = 0
let shown = 0
const listeners = new Set<() => void>()
const set = (next: ToastData[]) => {
	toasts = next
	for (const l of listeners) l()
}

/** Shows a note: what just happened, for a moment. Returns its id. */
export function toast(title: string, options: ToastOptions = {}): number {
	shown += 1
	const same = toasts.find((t) => t.title === title && t.description === options.description)
	if (same) {
		set(toasts.map((t) => (t === same ? { ...t, shown } : t)))
		return same.id
	}
	last += 1
	set([...toasts.slice(1 - TOAST_MOST), { ...options, id: last, title, duration: options.duration ?? TOAST_MS, shown }])
	return last
}

/** Takes a note away, or every note. */
toast.dismiss = (id?: number) => set(id === undefined ? [] : toasts.filter((t) => t.id !== id))

/** The notes showing, oldest first. */
export const getToasts = () => toasts

/** Calls `listener` whenever the notes change; returns the unsubscribe. */
export function subscribeToasts(listener: () => void) {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}
