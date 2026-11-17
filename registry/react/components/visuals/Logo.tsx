import type { CSSProperties } from 'react'
import { LOGOS, type LogoVariant } from '@/lib/logos'
import { cn } from '@/react/lib/cn'

// The logo, from the brand's own files (lib/logos.ts, split from the Figma export, never redrawn): the logomark, the
// 3D logomark, the wordmark and the horizontal, vertical and 3D combination marks. Black or White only: `tone` auto
// takes the text color (White on Black, Black on White), or force white or black. Size it by `height` (px); its width
// follows. Never stretch, recolor, outline, rotate or add effects to it.
export type LogoTone = 'auto' | 'white' | 'black'

export interface LogoProps {
  variant?: LogoVariant
  tone?: LogoTone
  /** Height in px (28 is the lockup on posts and ads at 183 by 28). */
  height?: number
  /** The accessible name. */
  label?: string
  className?: string
}

const TONES: Record<LogoTone, string> = { auto: 'text-fg', white: 'text-(--ds-color-white)', black: 'text-(--ds-color-black)' }

export function Logo({ variant = 'horizontal', tone = 'auto', height = 28, label = 'Spyglass', className }: LogoProps) {
  const l = LOGOS[variant]
  const style: CSSProperties = { height: `${height}px`, width: `${Math.round(((height * l.width) / l.height) * 100) / 100}px` }
  return (
    <svg data-ds="logo" role="img" aria-label={label} viewBox={`0 0 ${l.width} ${l.height}`} fill="currentColor" style={style} className={cn('block shrink-0', TONES[tone], className)} dangerouslySetInnerHTML={{ __html: l.body }} />
  )
}

export default Logo
