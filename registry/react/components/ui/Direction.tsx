'use client'
import type { ReactNode } from 'react'
import { DirectionContext, type Dir } from '@/react/hooks/useDirection'

// shadcn's direction provider: sets the reading direction for what is inside it (the `dir` attribute, so logical
// utilities such as ps-, me- and text-start follow it) and provides it to components through useDirection(). Code
// stays left to right: pre, code and kbd inside it keep `ltr`.
export interface DirectionProps {
  /** ltr or rtl. */
  dir?: Dir
  children?: ReactNode
}

export function Direction({ dir = 'ltr', children }: DirectionProps) {
  return (
    <DirectionContext.Provider value={dir}>
      <style href="ds-direction" precedence="ds">{css}</style>
      <div data-ds="direction" className="ds-dir" dir={dir}>{children}</div>
    </DirectionContext.Provider>
  )
}

export default Direction

const css = `
.ds-dir :is(pre, code, kbd) { direction: ltr; unicode-bidi: isolate; }
`
