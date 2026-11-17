'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Logo } from '@/react/components/visuals/Logo'
import { cn } from '@/react/lib/cn'

// A website's header in the assets' order: the lockup on the left (20px tall, the canvas's 183x28 times 2/3), the
// page links in DM Sans, and on the right a ghost sign-in and the one White button. Below 768px the links and the
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

const LINK = 'rounded-control type-ui text-fg-muted transition-[color] duration-150 ease-standard hover:text-fg aria-[current=page]:text-fg'

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
    <header data-ds="site-header" className={cn('relative flex h-16 items-center gap-8 text-fg', className)}>
      <a href={homeHref} aria-label={label} className="shrink-0 rounded-control"><Logo height={20} label={label} /></a>
      {links.length > 0 && (
        <nav aria-label="Main" className="max-md:hidden">
          <ul className="flex items-center gap-6">
            {links.map((l) => <li key={l.href}><a href={l.href} aria-current={l.current ? 'page' : undefined} className={LINK}>{l.label}</a></li>)}
          </ul>
        </nav>
      )}
      <div className="ml-auto flex items-center gap-2">
        {secondary && <div className="flex max-md:hidden"><Button href={secondary.href} variant="ghost" size="sm">{secondary.label}</Button></div>}
        {cta && <Button href={cta.href} size="sm">{cta.label}</Button>}
        {folded && (
          <div className="flex md:hidden">
            <Button ref={toggle} variant="ghost" size="sm" icon aria-label={open ? 'Close the menu' : 'Open the menu'} aria-expanded={open} aria-controls={panel} onClick={() => setOpen((o) => !o)}>
              {open ? <X size={16} strokeWidth={1.5} aria-hidden="true" /> : <Menu size={16} strokeWidth={1.5} aria-hidden="true" />}
            </Button>
          </div>
        )}
      </div>
      {folded && (
        <div id={panel} hidden={!open} className="absolute inset-x-0 top-full z-20 border-b border-edge bg-surface pt-2 pb-6 md:hidden">
          <ul className="grid gap-1">
            {links.map((l) => <li key={l.href}><a href={l.href} aria-current={l.current ? 'page' : undefined} className={cn(LINK, 'flex h-control-touch items-center')}>{l.label}</a></li>)}
            {secondary && <li><a href={secondary.href} className={cn(LINK, 'flex h-control-touch items-center')}>{secondary.label}</a></li>}
          </ul>
        </div>
      )}
    </header>
  )
}

export default SiteHeader
