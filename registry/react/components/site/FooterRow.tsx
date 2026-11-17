import { Logo } from '@/react/components/visuals/Logo'
import { cn } from '@/react/lib/cn'

// The row every post, ad and deck ends on: the lockup on the left and the domain on the right (the lockup 183x28 on
// the canvas, 20px tall here; the domain in DM Sans, or in capitals with `caps` as the posts set it). `links` puts a
// row of DM Sans links between them for a website footer; on phones they wrap onto their own line. Links change color
// on hover, nothing moves.
export interface FooterLink {
  label: string
  href: string
}

export interface FooterRowProps {
  /** The domain on the right. */
  domain: string
  /** Where the domain links (https://<domain> by default). */
  domainHref?: string
  /** Where the lockup links; without it the lockup is not a link. */
  homeHref?: string
  /** The domain in capitals with 6% tracking, as the posts set it. */
  caps?: boolean
  /** Links between the lockup and the domain. */
  links?: FooterLink[]
  /** The lockup's accessible name. */
  label?: string
  className?: string
}

const LINK = 'rounded-control text-fg-muted transition-[color] duration-150 ease-standard hover:text-fg'

export function FooterRow({ domain, domainHref, homeHref, caps = false, links = [], label = 'Spyglass', className }: FooterRowProps) {
  return (
    <div data-ds="footer-row" className={cn('flex flex-wrap items-center justify-between gap-x-8 gap-y-6 text-fg', className)}>
      {homeHref ? (
        <a href={homeHref} aria-label={label} className="rounded-control"><Logo height={20} label={label} /></a>
      ) : (
        <Logo height={20} label={label} />
      )}
      {links.length > 0 && (
        <nav aria-label="Footer" className="max-sm:order-last max-sm:w-full">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 type-ui">
            {links.map((l) => <li key={l.href}><a href={l.href} className={LINK}>{l.label}</a></li>)}
          </ul>
        </nav>
      )}
      <a href={domainHref ?? `https://${domain}`} className={cn('rounded-control text-fg', caps ? 'type-label' : 'type-ui')}>{domain}</a>
    </div>
  )
}

export default FooterRow
