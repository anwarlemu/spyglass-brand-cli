'use client'
import { useEffect } from 'react'
import { pointerEffectsOn } from '@/lib/effects/pointer'

// The site's ASCII lens (effect/AsciiLens): put one on a page and every ASCII drift and texture on it answers a mouse,
// a 240px lens filling the texture's empty cells near the pointer with more characters. It finds the drifts itself and
// draws inside each; it renders nothing of its own. Only for a fine pointer on a screen 768 wide or more, never with
// reduced motion.
export interface AsciiLensProps {
  /** Turn it off without removing it. */
  disabled?: boolean
}

export function AsciiLens({ disabled = false }: AsciiLensProps) {
  useEffect(() => {
    if (disabled || !pointerEffectsOn()) return
    let stop: (() => void) | null = null
    let gone = false
    void import('@/lib/effects/ascii-lens').then(({ startAsciiLens }) => {
      if (!gone) stop = startAsciiLens()
    })
    return () => {
      gone = true
      stop?.()
    }
  }, [disabled])
  return <span data-ds="ascii-lens" hidden />
}

export default AsciiLens
