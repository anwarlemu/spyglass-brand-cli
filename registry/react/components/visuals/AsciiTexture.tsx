import type { CSSProperties } from 'react'
import { ASCII_FONT, asciiGrid, asciiLines, type AsciiRect } from '@/lib/ascii'
import { cn } from '@/react/lib/cn'

// The ASCII texture, drawn from the seeded generator (lib/ascii.ts): Geist Mono characters from " .:-=+*#" off a soft
// heat map, White at 0.35 opacity. It keeps the frame's proportions, or with `cover` fills the box its classes give it
// (`absolute inset-0` behind a section), and sits behind the light.
// `clear` keeps areas free (text, the logo, photos), in the frame's px; the texture fades out around them. An accent,
// never the main graphic. Decoration: hidden from assistive tech.
export interface AsciiTextureProps {
  seed?: number
  /** How much of the frame is covered, 0 to 1. */
  density?: number
  /** The frame it is drawn for, in px (13.333px characters at 1080 wide). */
  width?: number
  height?: number
  /** Areas to keep clear, in the frame's px. */
  clear?: AsciiRect[]
  /** Fill the box the classes give it instead of keeping the frame's proportions. */
  cover?: boolean
  className?: string
}

export function AsciiTexture({ seed = 0, density = 0.5, width = 1080, height = 1080, clear = [], cover = false, className }: AsciiTextureProps) {
  const { cols, rows, cw, lh } = asciiGrid(width, height)
  const lines = asciiLines({ cols, rows, seed, density, clear: clear.map((r) => ({ x: r.x / cw, y: r.y / lh, w: r.w / cw, h: r.h / lh })) })
  const style: CSSProperties | undefined = cover ? undefined : { aspectRatio: `${width} / ${height}` }
  return (
    <div data-ds="ascii-texture" aria-hidden="true" style={style} className={cn('pointer-events-none overflow-hidden', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" className="block size-full fill-fg font-code">
        <g fillOpacity={ASCII_FONT.opacity} fontSize={ASCII_FONT.size} xmlSpace="preserve" className="whitespace-pre">
          {lines.map((line, j) => (line.trim() ? <text key={j} x={0} y={Math.round((j * lh + ASCII_FONT.size * 0.95) * 1000) / 1000}>{line}</text> : null))}
        </g>
      </svg>
    </div>
  )
}

export default AsciiTexture
