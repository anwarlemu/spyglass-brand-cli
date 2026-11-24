'use client'
import { useEffect, useRef } from 'react'
import { CURSOR_CSS, startCursor, type CursorMode } from '@/lib/effects/cursor'
import { pointerEffectsOn } from '@/lib/effects/pointer'
import { cn } from '@/react/lib/cn'

// The site's pointer effects (effect/PointerEffects, CursorSwitch): one cursor effect for the whole page, drawn on a
// fixed canvas behind it. `trail` (the site's default) throws a dashed trail of the brand light with a few ASCII
// characters when the mouse flicks; `lens` reveals a soft circle of characters over empty page as the mouse moves;
// `burst` sends a small burst of light chips where a thrown mouse stops; `off` draws nothing. Each keeps clear of text,
// controls and pictures. Only for a fine pointer on a screen 768 wide or more, never with reduced motion or forced
// colours. Put one in the page's layout; pair it with the ASCII lens for the drifts. Decoration: hidden from assistive tech.
export interface CursorEffectsProps {
  /** trail, lens, burst or off. */
  mode?: CursorMode
  className?: string
}

export function CursorEffects({ mode = 'trail', className }: CursorEffectsProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || mode === 'off' || !pointerEffectsOn()) return
    let stop: (() => void) | null = null
    let gone = false
    void startCursor(mode, canvas).then((s) => {
      if (gone) s()
      else stop = s
    })
    return () => {
      gone = true
      stop?.()
    }
  }, [mode])
  return (
    <>
      <style href="ds-cursor-effects" precedence="ds">{CURSOR_CSS}</style>
      <canvas ref={ref} data-ds="cursor-effects" data-mode={mode} aria-hidden="true" className={cn('ds-cursor', className)} />
    </>
  )
}

export default CursorEffects
