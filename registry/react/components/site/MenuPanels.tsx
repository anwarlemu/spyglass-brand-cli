'use client'
import { useState } from 'react'
import { NavIcon } from '@/react/components/site/NavIcon'
import { BrandLight } from '@/react/components/visuals/BrandLight'
import { headerMenus, type OfferRow, type ResourcesMenu, type SoonRow, type UseCasesMenu } from '@/lib/site-header'
import { cn } from '@/react/lib/cn'

// The site header's menu panels (site/Header MenuPanels): the use cases (two columns of rows with a 40px glyph, the name
// over a muted line, and a card on the right that crossfades to the row under the pointer or focus: up to three
// pictures and a longer line), the resources (rows with a 32px glyph, a coming-soon row in the faint gray with its
// badge, and the docs card with the brand light drifting behind an install line) and the strip of quieter links at the
// foot. The active row fills #262626 and its glyph brightens; nothing moves but the light (still with reduced motion).
export const ROW = 'group/row flex gap-3 rounded-ds-sm p-3 transition-[background-color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:bg-surface-raised data-active:bg-surface-raised'
export const GLYPH = 'grid flex-none place-items-center border border-edge bg-surface transition-[border-color] duration-160 ease-out group-hover/row:border-edge-strong group-hover/row:[--glyph-body:var(--ds-color-neutral-7)] group-hover/row:[--glyph-lit:var(--ds-color-fg)] group-focus-visible/row:border-edge-strong group-focus-visible/row:[--glyph-body:var(--ds-color-neutral-7)] group-focus-visible/row:[--glyph-lit:var(--ds-color-fg)] group-data-active/row:border-edge-strong group-data-active/row:[--glyph-body:var(--ds-color-neutral-7)] group-data-active/row:[--glyph-lit:var(--ds-color-fg)] [&_path]:transition-[fill,stroke] [&_path]:duration-160 [&_path]:ease-out'
export const STRIP = 'flex items-center gap-2 border-t border-edge py-1 pr-1 pl-4'
export const STRIP_LINK = 'flex h-8 items-center rounded-ds-sm px-2 type-ui-strong text-fg transition-[background-color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:bg-surface-raised'

/** A products row's body: the glyph, the name and the line. */
export function OfferRowBody({ item }: { item: OfferRow | SoonRow }) {
  return (
    <>
      <span className={cn(GLYPH, 'size-10 rounded-control')}><NavIcon name={item.icon} size={24} /></span>
      <span className="flex min-w-0 flex-col">
        <span className="type-ui-strong text-fg">{item.name}</span>
        <span className="type-ui text-fg-muted">{item.line}</span>
      </span>
    </>
  )
}

export function UseCasesPanel({ menu = headerMenus.useCases }: { menu?: UseCasesMenu }) {
  const [active, setActive] = useState(0)
  const rows = menu.rows
  const current = rows[active] ?? rows[0]
  return (
    <div data-ds="menu-panels" className="contents">
      <div className="flex gap-1 p-1">
        <ul className="grid min-w-0 flex-1 grid-flow-col grid-cols-2 grid-rows-3 content-start gap-1">
          {rows.map((item, i) => (
            <li key={item.key}>
              <a className={ROW} href={item.href} data-active={i === active || undefined} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)}>
                <span className={cn(GLYPH, 'size-10 rounded-control')}><NavIcon name={item.icon} size={24} /></span>
                <span className="flex min-w-0 flex-col">
                  <span className="type-ui-strong text-fg">{item.name}</span>
                  <span className="type-ui text-fg-muted">{item.line}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        {current ? (
          <a href={current.href} tabIndex={-1} aria-hidden="true" className="relative grid w-72 flex-none overflow-hidden rounded-ds-sm bg-surface-raised p-2 [contain:size]">
            {rows.map((item, i) => (
              <span key={item.key} data-on={i === active || undefined} className="flex min-h-0 flex-col opacity-0 transition-opacity duration-160 ease-out [grid-area:1/1] data-on:opacity-100">
                <span className="grid min-h-0 flex-none grid-cols-3 gap-1">
                  {[0, 1, 2].map((n) => (
                    <span key={n} className="relative aspect-4/5 overflow-hidden rounded-ds-sm bg-surface-subtle">
                      {item.shots?.[n] ? <img src={item.shots[n]} alt="" loading="eager" className="absolute inset-0 size-full object-cover" /> : null}
                    </span>
                  ))}
                </span>
                <span className="flex min-w-0 flex-none flex-col px-1 pt-2 pb-1">
                  <span className="type-ui-strong text-fg">{item.name}</span>
                  <span className="line-clamp-2 type-ui text-fg-muted">{item.card ?? item.line}</span>
                </span>
              </span>
            ))}
          </a>
        ) : null}
      </div>
      <div className={STRIP}>
        <a className={STRIP_LINK} href={menu.all.href}>{menu.all.label}</a>
        <ul className="flex gap-1">
          {menu.more.map((link) => <li key={link.label}><a className={cn(STRIP_LINK, 'font-regular text-fg-muted')} href={link.href}>{link.label}</a></li>)}
        </ul>
      </div>
    </div>
  )
}

export function ResourcesPanel({ menu = headerMenus.resources }: { menu?: ResourcesMenu }) {
  const docs = menu.feature
  return (
    <div data-ds="menu-panels" className="flex gap-1 p-1">
      <style href="ds-menu-panels" precedence="ds">{css}</style>
      <ul className="relative isolate flex w-64 flex-none flex-col gap-1">
        {menu.rows.map((row) => (
          <li key={row.key}>
            {row.soon ? (
              <span aria-disabled="true" className="group/row flex h-12 cursor-default items-center gap-3 rounded-ds-sm px-3 type-ui text-fg-faint">
                <span className={cn(GLYPH, 'size-8 rounded-ds-sm [--glyph-body:var(--ds-color-neutral-4)] [--glyph-lit:var(--ds-color-fg-faint)]')}><NavIcon name={row.icon} /></span>
                {row.title}
                <span className="ml-auto inline-flex h-6 items-center rounded-ds-sm bg-surface-inset px-2 type-caption font-medium text-fg-soft">{menu.soonLabel}</span>
              </span>
            ) : (
              <a href={row.href} {...(row.external ? { target: '_blank', rel: 'noreferrer' } : {})} className="group/row flex h-12 items-center gap-3 rounded-ds-sm px-3 type-ui-strong text-fg transition-[background-color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:bg-surface-raised">
                <span className={cn(GLYPH, 'size-8 rounded-ds-sm')}><NavIcon name={row.icon} /></span>
                {row.title}
              </a>
            )}
          </li>
        ))}
      </ul>
      <a href={docs.href} {...(docs.external ? { target: '_blank', rel: 'noreferrer' } : {})} className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-ds-sm bg-surface-raised p-2 transition-[background-color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] [contain:size] hover:bg-surface-hover">
        <span aria-hidden="true" className="relative min-h-0 flex-1 overflow-hidden bg-surface">
          <span className="ds-docs-wave absolute inset-0">
            <span className="ds-docs-ribbon absolute -inset-6 translate-y-6"><BrandLight variant="curved-strip" ground={false} cover className="absolute inset-0" /></span>
          </span>
          <code className="absolute top-3 left-3 font-code text-(length:--ds-text-caption) leading-(--ds-text-caption-leading) whitespace-nowrap text-fg-soft"><span className="text-fg-faint">$</span> {docs.code}</code>
        </span>
        <span className="flex min-w-0 flex-none flex-col px-1 pt-3 pb-1">
          <span className="type-ui-strong text-fg">{docs.title}</span>
          <span className="type-ui text-fg-muted">{docs.line}</span>
        </span>
      </a>
    </div>
  )
}

export default UseCasesPanel

const css = `
.ds-docs-wave { animation: ds-docs-slide var(--ds-header-band-slide) var(--ds-easing-drift) infinite alternate; }
.ds-docs-ribbon > * { animation: ds-docs-bob var(--ds-header-band-bob) var(--ds-easing-drift) infinite alternate; }
@keyframes ds-docs-slide { from { transform: translateX(calc(-1 * var(--ds-space-xl))); } to { transform: translateX(var(--ds-space-xl)); } }
@keyframes ds-docs-bob { from { transform: translateY(calc(-1 * var(--ds-space-sm))) rotate(-2deg); } to { transform: translateY(var(--ds-space-sm)) rotate(2deg); } }
@media (prefers-reduced-motion: reduce) { .ds-docs-wave, .ds-docs-ribbon > * { animation: none; } }
`
