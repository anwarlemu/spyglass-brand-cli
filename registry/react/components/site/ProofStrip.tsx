import type { CSSProperties } from 'react'
import { cn } from '@/react/lib/cn'

// The site's proof marquee (v3/V3Proof ProofStrip): a row of marks in the muted gray moving left at a constant, slow
// speed (one copy every 68s, linear, as constant motion is), fading out at both ends over 14% of the row. Under a mouse
// the row stops and the mark under the pointer turns White (color only; nothing moves). With reduced motion the row
// holds still. The moving row is hidden from assistive tech; the names are listed once for it instead.
// Marks come in through `logos`: an SVG or PNG `src` drawn as a mask in the gray (its own colors are not used), or,
// with no `src`, the name set as a Funnel Display wordmark, so no third-party logo is ever drawn by default.
export interface ProofLogo {
  name: string
  /** The mark's file (SVG or PNG), drawn in the muted gray. Leave out to set the name as a wordmark. */
  src?: string
  /** Its width over its height. */
  ratio?: number
  /** Its height in px (16 to 32). */
  height?: number
}

export interface ProofStripProps {
  logos?: ProofLogo[]
  /** 48px between marks instead of 64 (the sign-in page's row). */
  tight?: boolean
  className?: string
}

export const proofPlaceholders: ProofLogo[] = [{ name: 'Acme' }, { name: 'Acme Labs' }, { name: 'Acme Studio' }, { name: 'Acme Goods' }, { name: 'Acme Air' }, { name: 'Acme & Co' }]

export function ProofStrip({ logos = proofPlaceholders, tight = false, className }: ProofStripProps) {
  return (
    <div data-ds="proof-strip" className={cn('w-full max-w-288', className)}>
      <style href="ds-proof-strip" precedence="ds">{css}</style>
      <ul className="sr-only">{logos.map((l) => <li key={l.name}>{l.name}</li>)}</ul>
      <div aria-hidden="true" className="ds-proof-strip group/strip overflow-hidden">
        <ul role="list" className="ds-proof-track flex w-max items-center">
          {[0, 1, 2].flatMap((copy) => logos.map((l, i) => (
            <li key={`${copy}-${i}-${l.name}`} className={cn('group/mark grid h-8 flex-none place-items-center', tight ? 'px-6' : 'px-8')}>
              {l.src
                ? <span className="block bg-fg-muted transition-[background-color] duration-160 ease-out pointer-fine:group-hover/mark:bg-fg" style={{ height: l.height ?? 24, width: (l.height ?? 24) * (l.ratio ?? 4), mask: `url("${l.src}") center / contain no-repeat` } as CSSProperties} />
                : <span className="type-heading-4 whitespace-nowrap text-fg-muted transition-[color] duration-160 ease-out pointer-fine:group-hover/mark:text-fg">{l.name}</span>}
            </li>
          )))}
        </ul>
      </div>
    </div>
  )
}

export default ProofStrip

const css = `
.ds-proof-strip { mask-image: linear-gradient(to right, transparent, var(--ds-color-black) 14%, var(--ds-color-black) 86%, transparent); }
.ds-proof-track { animation: ds-proof-strip 68s linear infinite; }
@keyframes ds-proof-strip { to { transform: translateX(calc(-100% / 3)); } }
@media (hover: hover) and (pointer: fine) { .ds-proof-strip:hover .ds-proof-track { animation-play-state: paused; } }
@media (prefers-reduced-motion: reduce) { .ds-proof-track { animation: none; } }
`
