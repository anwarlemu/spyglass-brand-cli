'use client'
import { useEffect, useRef } from 'react'
import { createTemplatesWall, TEMPLATES_WALL_TILES } from '@/lib/templates-wall'
import { templatesWallContent, type TemplatesWallContent } from '@/lib/pages/templates'
import { cn } from '@/react/lib/cn'

// The site's templates wall (v2/V2Templates): a helix of tiles drifting toward the viewer and turning slowly around
// the words (lib/templates-wall.ts), the headline over a chip that rolls through the template names on a raised
// surface stretching to each name, the lead and a quiet status line. The tiles keep clear of the words and fade before
// the edges. `pictures` fills the tiles in turn (the user's own creatives, color as posted); without them the tiles
// take four neutral tones. `hero` makes it the page's first section (an h1, the window's height under the header);
// otherwise an h2 section with the section padding. Reduced motion holds one still frame; `at` draws the frame at
// that time (ms) and holds it.
export interface TemplatesWallProps {
	content?: TemplatesWallContent
	/** Pictures for the tiles, used in turn; none draws neutral tones. */
	pictures?: string[]
	/** The page's first section: an h1 and the window's height less the header. */
	hero?: boolean
	/** Draw the frame at this time (ms) and hold it. */
	at?: number
	/** The section's id (its heading is `<id>-heading`). */
	id?: string
	className?: string
}

const TILES = Array.from({ length: TEMPLATES_WALL_TILES }, (_, j) => j)

export function TemplatesWall({ content: c = templatesWallContent, pictures, hero = false, at, id = 'templates', className }: TemplatesWallProps) {
	const scene = useRef<HTMLDivElement>(null)
	const key = `${(pictures ?? []).join('|')}|${at ?? ''}|${c.names.join('|')}`
	useEffect(() => {
		const root = scene.current
		if (!root) return
		const one = (name: string) => root.querySelector<HTMLElement>(`[data-tpl="${name}"]`)!
		const all = (name: string) => [...root.querySelectorAll<HTMLElement>(`[data-tpl="${name}"]`)]
		const wall = createTemplatesWall({ root, tunnel: one('tunnel'), box: one('box'), tiles: all('tile'), rows: all('row'), names: all('name'), chip: one('chip'), capL: one('cap-l'), capR: one('cap-r'), bar: one('bar') }, { pictures, at })
		return () => wall.destroy()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key])
	const Heading = hero ? 'h1' : 'h2'
	const headingId = `${id}-heading`
	return (
		<section data-ds="templates-wall" id={id} aria-labelledby={headingId} data-hero={hero ? '' : undefined} className={cn('ds-tpl relative isolate z-1 overflow-hidden bg-surface text-fg', className)}>
			<style href="ds-templates-wall" precedence="ds">{css}</style>
			<div ref={scene} className="ds-tpl-scene relative grid place-items-center">
				<div aria-hidden="true" data-tpl="tunnel" className="pointer-events-none absolute inset-0">
					<div data-tpl="box" className="ds-tpl-box">
						{TILES.map((j) => <span key={j} data-tpl="tile" className="ds-tpl-tile" />)}
					</div>
				</div>
				<div className="relative z-1 mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-col items-center px-(--ds-layout-gutter) text-center">
					<div className="ds-tpl-line flex flex-col items-center gap-y-2 type-section text-fg">
						<Heading id={headingId} data-tpl="row" className="ds-tpl-headline whitespace-nowrap">{c.headline}</Heading>
						<span aria-hidden="true" data-tpl="chip" className="ds-tpl-chip relative inline-grid px-3 md:px-4">
							<span className="ds-tpl-surface absolute inset-0">
								<span data-tpl="cap-l" className="ds-tpl-cap" />
								<span data-tpl="bar" className="ds-tpl-bar" />
								<span data-tpl="cap-r" className="ds-tpl-cap" />
							</span>
							<span className="ds-tpl-window relative grid justify-items-center overflow-hidden py-2">
								{c.names.map((name) => <span key={name} data-tpl="name" className="ds-tpl-name whitespace-nowrap">{name}</span>)}
							</span>
						</span>
					</div>
					<ul className="sr-only">
						{c.names.map((name) => <li key={name}>{name}</li>)}
					</ul>
					<div className="mt-8 flex flex-col items-center gap-4">
						<p data-tpl="row" className="ds-tpl-lead max-w-(--ds-layout-measure) type-body-xl text-fg-soft">{c.lead}</p>
						<p data-tpl="row" className="type-ui text-fg-faint">{c.status}</p>
					</div>
				</div>
			</div>
		</section>
	)
}

export default TemplatesWall

const css = `
.ds-tpl { padding-block: var(--ds-layout-section); }
.ds-tpl[data-hero] { padding-block: 0 calc(var(--ds-layout-section) - var(--ds-templates-edge)); }
.ds-tpl-scene { min-height: 100svh; }
.ds-tpl[data-hero] .ds-tpl-scene { min-height: calc(100svh - var(--ds-space-4xl)); }
.ds-tpl-box {
  position: absolute; top: 50%; left: 50%;
  width: calc(var(--ds-templates-design-w) * 1px); height: calc(var(--ds-templates-design-h) * 1px);
  perspective: var(--ds-templates-perspective); transform: translate(-50%, -50%);
}
.ds-tpl-tile {
  position: absolute; inset: 0; display: block; margin: auto;
  width: var(--ds-templates-tile-w); height: var(--ds-templates-tile-h);
  border-radius: var(--ds-radius-sm); background-color: var(--ds-color-surface-subtle);
  background-position: center; background-size: cover; background-repeat: no-repeat;
  visibility: hidden; opacity: 0; backface-visibility: hidden; user-select: none; will-change: transform, opacity;
}
.ds-tpl-tile[data-tone="1"] { background-image: linear-gradient(var(--ds-color-neutral-4), var(--ds-color-neutral-2)); }
.ds-tpl-tile[data-tone="2"] { background-image: linear-gradient(var(--ds-color-neutral-5), var(--ds-color-neutral-3)); }
.ds-tpl-tile[data-tone="3"] { background-image: linear-gradient(var(--ds-color-neutral-6), var(--ds-color-neutral-4)); }
.ds-tpl-tile[data-tone="4"] { background-image: linear-gradient(var(--ds-color-neutral-7), var(--ds-color-neutral-5)); }
.ds-tpl-headline { font: inherit; }
.ds-tpl-lead { font-weight: var(--ds-font-weight-medium); text-wrap: balance; }
.ds-tpl-surface { opacity: 0; }
.ds-tpl-scene[data-ready] .ds-tpl-surface { opacity: var(--ds-templates-chip-opacity); }
.ds-tpl-cap, .ds-tpl-bar { position: absolute; top: 0; left: 50%; height: 100%; background: var(--ds-color-surface-raised); translate: -50% 0; }
.ds-tpl-cap { aspect-ratio: 1; border-radius: var(--ds-radius-panel); }
.ds-tpl-bar { width: var(--ds-space-4xl); }
.ds-tpl-window { mask-image: linear-gradient(transparent, var(--ds-color-black) var(--ds-space-md), var(--ds-color-black) calc(100% - var(--ds-space-md)), transparent); }
.ds-tpl-name { grid-area: 1 / 1; }
.ds-tpl-name:not(:first-child) { opacity: 0; }
@media (min-width: 768px) {
  .ds-tpl-scene {
    --ds-templates-design-w: var(--ds-templates-design-w-md); --ds-templates-design-h: var(--ds-templates-design-h-md);
    --ds-templates-count: var(--ds-templates-count-md); --ds-templates-near: var(--ds-templates-near-md);
  }
}
@media (min-width: 1024px) { .ds-tpl[data-hero] .ds-tpl-scene { min-height: calc(100svh - var(--ds-size-header)); } }
@media (width < 372px) {
  .ds-tpl-line { font-size: var(--ds-text-heading-3); line-height: var(--ds-text-heading-3-leading); }
  .ds-tpl-lead { font-size: var(--ds-text-heading-4); line-height: var(--ds-text-heading-4-leading); }
}
`
