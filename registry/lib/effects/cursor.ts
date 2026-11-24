// The cursor effects' canvas (effect/Cursor*/cursor-*-effect.module.css), shared by both flavors: fixed behind the
// page, blended plus-lighter, shown only while drawing, for a fine pointer without reduced motion, never in forced
// colours.
export type CursorMode = 'trail' | 'lens' | 'burst' | 'off'

export const CURSOR_CSS = `
.ds-cursor { position: fixed; inset: 0; z-index: -1; display: none; width: 100%; height: 100%; pointer-events: none; user-select: none; mix-blend-mode: plus-lighter; }
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) { .ds-cursor[data-on] { display: block; } }
@media (forced-colors: active) { .ds-cursor[data-on] { display: none; } }
`

/** Starts the mode's effect on the canvas; resolves to its stop. */
export async function startCursor(mode: CursorMode, canvas: HTMLCanvasElement): Promise<() => void> {
	if (mode === 'trail') return (await import('@/lib/effects/cursor-trail')).mountTrail(canvas)
	if (mode === 'lens') return (await import('@/lib/effects/cursor-lens')).mountLens(canvas)
	if (mode === 'burst') return (await import('@/lib/effects/cursor-burst')).mountBurst(canvas)
	return () => {}
}
