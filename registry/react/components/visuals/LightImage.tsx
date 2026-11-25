'use client'
import { useEffect, useRef } from 'react'
import { startGrain } from '@/lib/effects/grain'
import { LIGHT_ART, type LightArtName } from '@/lib/effects/light-art'
import { LIGHT_IMAGE_CSS } from '@/lib/effects/light-image'
import { whilePointerEffects } from '@/lib/effects/pointer'
import { cn } from '@/react/lib/cn'

// The site's light image (effect/LightImage): one of the site's pre-made light pictures (`art`, lib/effects/light-art.ts,
// or your own through `picture`), with the ASCII grain drawn where its light falls off into Black. With a `mask`, a fine
// pointer and no reduced motion, the light is redrawn in WebGL from the mask, its Blue, Green and Red split `split` px,
// and a lens magnifies it and widens the split around the pointer. The box keeps the picture's frame (`width`, `height`
// in px); the classes size and place it and must position it (`absolute` behind a section, or `relative`). `still`
// keeps the grain and drops the lens (a fixed frame); without the lens the box carries `data-offscreen` while it is off
// screen, for a drift around it to pause on. The lens starts and stops as the pointer and motion settings change. Decoration: hidden from assistive tech, never under reading text.
export interface LightImageProps {
  /** One of the site's own light pictures, with its mask, frame and split: hero-band or pricing. */
  art?: LightArtName
  /** Your own light picture (a URL or a data URI), instead of `art`. */
  picture?: string
  /** Its mask, for the WebGL lens. */
  mask?: string
  /** The frame the picture was drawn for, in px. */
  width?: number
  height?: number
  /** How far apart the lens draws the Blue, Green and Red copies, in the frame's px. */
  split?: number
  /** Draw the ASCII grain around the light (on by default). */
  grain?: boolean
  /** No lens: the picture and its grain as they are. */
  still?: boolean
  /** Load the picture first (above the fold). */
  priority?: boolean
  className?: string
}

export function LightImage({ art = 'hero-band', picture: ownPicture, mask: ownMask, width: ownWidth, height: ownHeight, split: ownSplit, grain = true, still = false, priority = false, className }: LightImageProps) {
  const set = ownPicture ? undefined : LIGHT_ART[art]
  const picture = ownPicture ?? set?.picture ?? ''
  const mask = ownPicture ? ownMask : set?.mask
  const width = ownWidth ?? set?.width ?? 1
  const height = ownHeight ?? set?.height ?? 1
  const split = ownSplit ?? set?.split ?? 0
  const boxRef = useRef<HTMLSpanElement>(null)
  const lensRef = useRef<HTMLCanvasElement>(null)
  const grainRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const box = boxRef.current
    const canvas = grainRef.current
    if (!grain || !box || !canvas) return
    return startGrain(box, canvas, picture, width, height, still)
  }, [grain, picture, width, height, still])

  useEffect(() => {
    const box = boxRef.current
    const canvas = lensRef.current
    if (!box || !canvas || !mask || still) return
    return whilePointerEffects(() => import('@/lib/effects/lens-gl').then(({ startLens }) => startLens({ box, canvas, mask, width, height, split })))
  }, [mask, width, height, split, still])

  // Without the lens, the box says when it is off screen (data-offscreen), so a drifting light around it can pause.
  useEffect(() => {
    const box = boxRef.current
    if (!box || (mask && !still)) return
    const view = new IntersectionObserver(([entry]) => box.toggleAttribute('data-offscreen', !entry.isIntersecting))
    view.observe(box)
    return () => {
      view.disconnect()
      box.removeAttribute('data-offscreen')
    }
  }, [mask, still])

  return (
    <span ref={boxRef} data-ds="light-image" aria-hidden="true" className={cn('ds-light-image block', className)}>
      <style href="ds-light-image" precedence="ds">{LIGHT_IMAGE_CSS('.ds-light-image', '.ds-light-image[data-gl]')}</style>
      <img className="ds-light-picture" src={picture} alt="" width={width} height={height} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" draggable={false} />
      {mask && !still ? <canvas ref={lensRef} className="ds-light-lens" /> : null}
      {grain ? <canvas ref={grainRef} className="ds-light-grain" /> : null}
    </span>
  )
}

export default LightImage
