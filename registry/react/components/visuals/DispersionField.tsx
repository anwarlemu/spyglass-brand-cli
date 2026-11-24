'use client'
import { useEffect, useRef } from 'react'
import type { DragSource } from '@/lib/effects/field-drag'
import { mountField, type RippleSource } from '@/lib/effects/field-engine'
import type { Composition } from '@/lib/effects/field-layout'
import { FIELD_CSS, NO_PICTURE } from '@/lib/effects/field'
import type { FieldStill } from '@/lib/effects/field-stills'
import { cn } from '@/react/lib/cn'

// The site's dispersion field (effect/DispersionField): the brand light drawn live in WebGL as soft blobs bent by slow
// waves, split into Blue, Green and Red, with the ASCII ghost of the light around it. `composition` places it (hero,
// close, band, frame, logo, crown, works, ring, horizon, wordmark, run) and `seed` varies it. It starts when it comes
// near the screen, drifts at 30 frames a second while visible and sleeps off screen. `interactive` lets a fine pointer
// bring a lens; `drag` lets the page's cards push the light, `ripple` lets a ring stir it. With reduced motion or `still`
// it draws one fixed frame and ignores the pointer. `stills` (lib/effects/field-stills.ts) show from 1024 wide until it
// has drawn. The classes size and place the canvas (`absolute inset-0 size-full` behind a section). Decoration: hidden
// from assistive tech, behind the content, never under reading text.
export type { Composition as FieldComposition, DragSource, RippleSource, FieldStill }
export interface DispersionFieldProps {
  /** Where the light sits: hero, close, band, frame, logo, crown, works, ring, horizon, wordmark or run. */
  composition?: Composition
  /** The same seed draws the same field. */
  seed?: number
  /** A fine pointer brings a lens over the light (on by default). */
  interactive?: boolean
  /** One fixed frame: no drift, no pointer. */
  still?: boolean
  /** The page's cards, which push and stir the light as they move. */
  drag?: DragSource
  /** A ring's ripple (the ring composition). */
  ripple?: RippleSource
  /** Draw on a transparent ground, to lay over a picture. */
  overlay?: boolean
  /** Still frames per width range, shown from 1024 until the field has drawn. */
  stills?: FieldStill[]
  className?: string
}

export function DispersionField({ composition = 'hero', seed = 0, interactive = true, still = false, drag, ripple, overlay = false, stills, className }: DispersionFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let field: ReturnType<typeof mountField> = null
    const near = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      near.disconnect()
      field = mountField(canvas, { composition, seed, interactive, still, drag, ripple, overlay })
    }, { rootMargin: '100% 0px' })
    near.observe(canvas)
    return () => {
      near.disconnect()
      field?.destroy()
    }
  }, [composition, seed, interactive, still, drag, ripple, overlay])

  return (
    <>
      <style href="ds-dispersion-field" precedence="ds">{FIELD_CSS('.ds-field')}</style>
      <canvas ref={ref} data-ds="dispersion-field" aria-hidden="true" className={cn('ds-field block', className)} />
      {stills ? (
        <picture>
          {stills.map((s) => <source key={s.media} media={s.media} srcSet={s.src} />)}
          <img className={cn('ds-field-still', className)} src={NO_PICTURE} alt="" aria-hidden="true" fetchPriority="high" decoding="async" draggable={false} />
        </picture>
      ) : null}
    </>
  )
}

export default DispersionField
