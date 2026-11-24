'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Logo } from '@/react/components/visuals/Logo'
import { cn } from '@/react/lib/cn'

// The site's header (Header.module.css): 64px tall, 72px from 1024; the lockup on the left (20px tall), the page links
// from 1024, centered from 1280 (DM Sans 14/20 in #D4D4D4, 36px tall with 16px in, an 8px corner that fills #262626 under the
// pointer), and on the right the sign-in in the same style and the one White 36px button. Below 1024 the links and the
// sign-in fold behind a menu button; the panel opens in place under the bar, without motion (it is a tool, opened
// often), and Escape closes it and returns focus to the button. Links change color on hover; nothing moves.
export interface HeaderLink {
  label: string
  href: string
  /** The page being shown. */
  current?: boolean
}

export interface HeaderAction {
  label: string
  href: string
}

export interface SiteHeaderProps {
  links?: HeaderLink[]
  /** The White button on the right. */
  cta?: HeaderAction
  /** A ghost link before it (sign in). */
  secondary?: HeaderAction
  /** Where the lockup links. */
  homeHref?: string
  /** The lockup's accessible name. */
  label?: string
  className?: string
}

// The bar's links take h-control-xs and their padding; the folded panel's take the touch height.
const BAR = 'h-control-xs px-4'
const LINK = 'flex items-center rounded-control type-ui text-fg-soft transition-[color,background-color] duration-160 ease-standard hover:bg-surface-raised hover:text-fg aria-[current=page]:text-fg'

export function SiteHeader({ links = [], cta, secondary, homeHref = '/', label = 'Spyglass', className }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const panel = `site-menu${useId().replace(/[^\w-]/g, '')}`
  const toggle = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggle.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  const folded = links.length > 0 || !!secondary
  return (
    <header data-ds="site-header" className={cn('relative flex h-16 items-center gap-8 text-fg lg:h-header xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-4', className)}>
      <a href={homeHref} aria-label={label} className="shrink-0 justify-self-start rounded-control"><Logo height={20} label={label} /></a>
      {links.length > 0 && (
        <nav aria-label="Main" className="max-lg:hidden">
          <ul className="flex items-center gap-1">
            {links.map((l) => <li key={l.href}><a href={l.href} aria-current={l.current ? 'page' : undefined} className={cn(LINK, BAR)}>{l.label}</a></li>)}
          </ul>
        </nav>
      )}
      <div className="ml-auto flex items-center gap-2 justify-self-end">
        {secondary && <div className="flex max-lg:hidden"><a href={secondary.href} className={cn(LINK, 'h-control-xs px-3')}>{secondary.label}</a></div>}
        {cta && <Button href={cta.href} size="xs">{cta.label}</Button>}
        {folded && (
          <div className="flex lg:hidden">
            <Button ref={toggle} variant="ghost" size="xs" icon aria-label={open ? 'Close the menu' : 'Open the menu'} aria-expanded={open} aria-controls={panel} onClick={() => setOpen((o) => !o)}>
              {open ? <X size={16} strokeWidth={1.5} aria-hidden="true" /> : <Menu size={16} strokeWidth={1.5} aria-hidden="true" />}
            </Button>
          </div>
        )}
      </div>
      {folded && (
        <div id={panel} hidden={!open} className="absolute inset-x-0 top-full z-20 border-b border-edge bg-surface pt-2 pb-6 lg:hidden">
          <ul className="grid gap-1">
            {links.map((l) => <li key={l.href}><a href={l.href} aria-current={l.current ? 'page' : undefined} className={cn(LINK, 'h-control-touch px-3')}>{l.label}</a></li>)}
            {secondary && <li><a href={secondary.href} className={cn(LINK, 'h-control-touch px-3')}>{secondary.label}</a></li>}
          </ul>
        </div>
      )}
    </header>
  )
}

export default SiteHeader
