'use client'
import { useEffect, useRef } from 'react'
import { whilePointerEffects } from '@/lib/effects/pointer'
import { cn } from '@/react/lib/cn'

// The site's ASCII trail (effect/AsciiTrail): a mouse leaves a short trail of ASCII characters that fades in 700ms. In
// `section` mode the canvas is absolute in its section (the classes size it, `inset-0`) and follows the pointer over the
// section; in `page` mode it is fixed behind the whole page. Only for a fine pointer on a screen 768 wide or more, and
// off with reduced motion; on touch it draws nothing. Decoration: hidden from assistive tech.
export interface AsciiTrailProps {
  /** section (absolute in its section) or page (fixed behind the page). */
  mode?: 'section' | 'page'
  className?: string
}

export function AsciiTrail({ mode = 'section', className }: AsciiTrailProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    return whilePointerEffects(() => import('@/lib/effects/ascii-trail').then(({ startTrail }) => startTrail(canvas, mode)))
  }, [mode])
  return <canvas ref={ref} data-ds="ascii-trail" data-ascii-trail={mode} aria-hidden="true" className={cn('pointer-events-none block text-fg', mode === 'page' ? 'fixed inset-0 -z-1 size-full' : 'absolute', className)} />
}

export default AsciiTrail
