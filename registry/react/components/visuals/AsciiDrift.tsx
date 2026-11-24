import { asciiDriftStyleObject, type AsciiDriftCrop, type AsciiDriftFrom, type AsciiDriftStrength } from '@/lib/ascii-drift'
import { cn } from '@/react/lib/cn'

// The site's ASCII drift (ui/AsciiDrift): a crop of the ASCII texture tile behind a section, fading out radially from
// one side. It is absolute and behind the content (z -1); the classes size and place it (`top-0 left-0 h-[44%] w-[36%]`)
// inside a positioned section. Decoration: hidden from assistive tech and from print, it never moves.
export interface AsciiDriftProps {
  /** Which part of the tile shows: mass, column, cluster or scatter. */
  crop?: AsciiDriftCrop
  /** The side the fade starts from: centre, left, right, top or bottom. */
  from?: AsciiDriftFrom
  /** quiet (0.5), faint (0.32) or hero (full, with a wider core). */
  strength?: AsciiDriftStrength
  className?: string
}

export function AsciiDrift({ crop = 'mass', from = 'centre', strength = 'quiet', className }: AsciiDriftProps) {
  return <span data-ds="ascii-drift" aria-hidden="true" style={asciiDriftStyleObject(crop, from, strength)} className={cn('pointer-events-none absolute -z-1 select-none print:hidden', className)} />
}

export default AsciiDrift
