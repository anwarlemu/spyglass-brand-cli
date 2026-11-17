import { CreativeCard } from '@/react/components/site/CreativeCard'
import { cn } from '@/react/lib/cn'

// The testimonial ad (Ad, Testimonial): a 4/5 headshot in the brand corner, the quote in Funnel Display (40px on the
// canvas, 28px here) in curly quotes, the name in DM Sans and the position (role and company) in capitals under it. `stacked` is the ad (the
// headshot half the width above the quote); `side` puts the headshot beside the words, for a page. Without `image`
// the headshot is the neutral placeholder, and with `image={false}` there is none.
export interface TestimonialProps {
  /** The words, without quote marks. */
  quote: string
  name: string
  /** Role and company, shown in capitals. */
  position?: string
  /** The headshot (src), the placeholder (undefined) or none (false). */
  image?: string | false
  /** stacked (the ad) or side. */
  layout?: 'stacked' | 'side'
  className?: string
}

export function Testimonial({ quote, name, position, image, layout = 'stacked', className }: TestimonialProps) {
  const side = layout === 'side'
  return (
    <figure data-ds="testimonial" className={cn('m-0 grid text-fg', side ? 'grid-cols-5 items-center gap-12 max-md:grid-cols-1 max-md:gap-8' : 'gap-10 max-sm:gap-8', className)}>
      {image !== false && (
        <div className={side ? 'col-span-2 max-md:col-span-1 max-md:w-1/2' : 'w-1/2'}>
          <CreativeCard src={image || undefined} alt={image ? name : `${name}, headshot`} tone={3} ratio="4/5" />
        </div>
      )}
      <div className={cn('grid gap-6', side && 'col-span-3 max-md:col-span-1')}>
        <blockquote className="m-0 type-heading-2 leading-(--ds-text-display-leading)">
          <p>{`“${quote}”`}</p>
        </blockquote>
        <figcaption className="grid gap-1">
          <span className="type-body text-fg">{name}</span>
          {position && <span className="type-label text-fg-muted">{position}</span>}
        </figcaption>
      </div>
    </figure>
  )
}

export default Testimonial
