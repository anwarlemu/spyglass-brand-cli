'use client'
import { useEffect, useMemo, useRef } from 'react'
import { startAbstractCanvas, type Moment } from '@/lib/effects/abstract'
import { abstractSet, type AbstractKind, type Cluster, type Tag } from '@/lib/effects/abstract-kinds'
import { cn } from '@/react/lib/cn'

// The site's abstract canvases (abstract/Abstract): an ASCII drawing in a 14:13 panel on the raised surface, drawn on a
// canvas while it is on screen. `archive`: a brand's records as rows of characters, new days arriving at the top and
// older ones packing toward the foot. `tags`: a field of characters resolving into tags one at a time. `graph`: the
// brand in the middle linked to clusters of its records. With reduced motion it shows the settled frame; `freeze`
// holds a moment (start, middle or settled). The canvas is hidden from assistive tech and a line says what it shows.
export type { AbstractKind, Cluster, Tag }
export interface AbstractCanvasProps {
  /** archive, tags or graph. */
  kind?: AbstractKind
  /** The tags the field resolves into (tags). */
  tags?: Tag[]
  /** The brand in the middle (graph). */
  brand?: string
  /** The clusters around it (graph). */
  clusters?: Cluster[]
  /** Hold one moment: start, middle or settled. */
  freeze?: Moment
  className?: string
}

export function AbstractCanvas({ kind = 'archive', tags, brand, clusters, freeze, className }: AbstractCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const set = useMemo(() => abstractSet(kind, { tags, brand, clusters }), [kind, tags, brand, clusters])
  useEffect(() => {
    const canvas = ref.current
    return canvas ? startAbstractCanvas(canvas, set.draw, { fps: set.fps, moments: set.moments, freeze }) : undefined
  }, [set, freeze])
  return (
    <div data-ds="abstract-canvas" data-name={set.name} className={cn('relative aspect-[14/13] overflow-hidden rounded-panel bg-surface-raised select-none', className)}>
      <canvas ref={ref} aria-hidden="true" className="absolute inset-0 block size-full" />
      <p className="sr-only">{set.summary}</p>
    </div>
  )
}

/** The archive rows. */
export const ArchiveRows = (props: Omit<AbstractCanvasProps, 'kind'>) => <AbstractCanvas kind="archive" {...props} />
/** The tag field. */
export const TagField = (props: Omit<AbstractCanvasProps, 'kind'>) => <AbstractCanvas kind="tags" {...props} />
/** The brand graph. */
export const BrandGraph = (props: Omit<AbstractCanvasProps, 'kind'>) => <AbstractCanvas kind="graph" {...props} />

export default AbstractCanvas
