import { ProofStrip, proofPlaceholders, type ProofLogo } from '@/react/components/site/ProofStrip'
import { cn } from '@/react/lib/cn'

// The site's proof section (v3/V3Proof): a White lead line (20/28) centered over the proof marquee, 40px apart, with
// the section's padding under it only (it follows a hero). Marks come through `logos` (Acme placeholders by default).
export interface ProofBlockProps {
  /** The line over the marks. */
  title?: string
  logos?: ProofLogo[]
  /** Names the heading (`<id>-title`). */
  id?: string
  className?: string
}

export function ProofBlock({ title = 'Trusted by teams and agents at', logos = proofPlaceholders, id = 'proof', className }: ProofBlockProps) {
  return (
    <section data-ds="proof-block" aria-labelledby={`${id}-title`} className={cn('pb-(--ds-layout-section) text-fg', className)}>
      <div className="mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-col items-center gap-10 px-(--ds-layout-gutter) text-center">
        <h2 id={`${id}-title`} className="type-body-lg text-fg">{title}</h2>
        <ProofStrip logos={logos} />
      </div>
    </section>
  )
}

export default ProofBlock
