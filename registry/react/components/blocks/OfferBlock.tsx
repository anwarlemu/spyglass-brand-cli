import type { ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { BrandLight } from '@/react/components/visuals/BrandLight'
import { AsciiTexture } from '@/react/components/visuals/AsciiTexture'
import { cn } from '@/react/lib/cn'

// The offer, as the posts and the Creator plan ad close: a centered Funnel Display headline, the terms in capitals
// with concrete numbers, and one White button, with the light flowing in around them (`corner`) or from the top
// (`field`, as the ad sets it over a plan card); on phones, where the corners are too close to the
// headline, the corner light becomes the field above it. The children replace the terms and the button (a plan card). The
// offer post's spacing times 2/3: the terms 24px under the headline, the button 24px under the terms.
export interface OfferBlockProps {
  headline: ReactNode
  /** The terms, set in capitals: "$10 for your first month, then $20/month". */
  note?: ReactNode
  /** The White button. */
  cta?: { label: string; href?: string }
  /** corner (the offer post) or field (the plan ad). */
  light?: 'corner' | 'field'
  seed?: number
  /** The ASCII texture behind the light. */
  texture?: boolean
  /** Instead of the terms and the button: a plan card. */
  children?: ReactNode
  className?: string
}

// Where the texture keeps clear, in its 1440x900 frame: the headline and the terms, or the column of the plan card.
const CLEAR = { corner: [{ x: 200, y: 140, w: 1040, h: 620 }], field: [{ x: 280, y: 0, w: 880, h: 900 }] }

export function OfferBlock({ headline, note, cta, light = 'corner', seed = 0, texture = true, children, className }: OfferBlockProps) {
  return (
    <section data-ds="offer-block" className={cn('relative isolate overflow-hidden bg-surface text-fg', className)}>
      {texture && <AsciiTexture seed={seed + 3} width={1440} height={900} density={0.35} clear={CLEAR[light] ?? CLEAR.corner} cover className="absolute inset-0 -z-10 size-full" />}
      {light === 'corner' ? (
        <>
          <BrandLight variant="corner" seed={seed} ground={false} cover className="absolute inset-0 -z-10 size-full max-sm:hidden" />
          <BrandLight variant="field" seed={seed} ground={false} cover className="absolute inset-x-0 top-0 -z-10 h-48 mask-b-from-40% sm:hidden" />
        </>
      ) : (
        <BrandLight variant="field" seed={seed} ground={false} cover className="absolute inset-x-0 top-0 -z-10 h-80 mask-b-from-40% max-sm:h-48" />
      )}
      <div className={cn('mx-auto flex w-full max-w-page flex-col items-center px-12 text-center max-sm:px-4', light === 'field' ? 'pt-72 pb-24 max-sm:pt-44 max-sm:pb-16' : 'py-32 max-sm:pt-44 max-sm:pb-20')}>
        <h2 className="max-w-3xl type-section">{headline}</h2>
        {children ? (
          <div className="mt-12 flex w-full justify-center max-sm:mt-8">{children}</div>
        ) : (
          <>
            {note && <p className="mt-6 type-label text-fg">{note}</p>}
            {cta && <Button href={cta.href} size="lg" className="mt-6">{cta.label}</Button>}
          </>
        )}
      </div>
    </section>
  )
}

export default OfferBlock
