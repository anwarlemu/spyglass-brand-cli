import type { ReactNode } from 'react'
import { FooterRow, type FooterLink } from '@/react/components/site/FooterRow'
import { cn } from '@/react/lib/cn'

// A website's footer band, as every page template ends: a hairline above, the footer row (the lockup, the links, the
// domain) inside the page width, and an optional line under it in the muted gray (the legal line). Links change color
// on hover; nothing moves.
export interface FooterBlockProps {
  /** The domain on the right. */
  domain: string
  links?: FooterLink[]
  /** Where the lockup links. */
  homeHref?: string
  /** A line under the row: "© 2026 Acme Inc." */
  note?: ReactNode
  className?: string
}

export function FooterBlock({ domain, links = [], homeHref = '/', note, className }: FooterBlockProps) {
  return (
    <footer data-ds="footer-block" className={cn('border-t border-edge bg-surface text-fg', className)}>
      <div className="mx-auto grid w-full max-w-page-wide gap-8 px-12 py-10 max-sm:px-4">
        <FooterRow domain={domain} homeHref={homeHref} links={links} />
        {note && <p className="type-caption text-fg-muted">{note}</p>}
      </div>
    </footer>
  )
}

export default FooterBlock
