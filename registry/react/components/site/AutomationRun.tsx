'use client'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { runContent, runCss, runPlaceholders, runStats, startRun, type RunApi, type RunContent, type RunItem } from '@/lib/automation-run'
import { cn } from '@/react/lib/cn'

// The site's automation run (pages/Enterprise/AutomationRun): a quote in the section head (32/36, 44/48 at 768, 56/60 at
// 1024, its opening mark hung from 768), then a stage that rises under it (96px at 768, 128 at 1280) where a batch of
// skewed square cards (4px corner, 16% of the width from 768, 32% on phones) rushes in along a rising conveyor and keeps
// drifting at 15px a second, never over the quote's words. Under the pointer, focus or a tap a card rises (112, 140, 180px)
// and turns 12 degrees on a spring, the cards ahead give way, the conveyor calms, and after 80ms a note opens beside it:
// the advertiser and headline over a thumb, Live, Ended or Post, how long it has run (or its views) and when it was
// first seen, the facts that are not numbers as chips, and where it was found. Escape or a tap elsewhere lowers it.
// Reduced motion holds the batch at rest and raises nothing. Items take your creatives (`src`, `video`); without them
// each card is a neutral gradient.
export interface AutomationRunProps {
	items?: RunItem[]
	content?: RunContent
	/** The section's id (the heading is `<id>-heading`). */
	id?: string
	className?: string
}

export function AutomationRun({ items = runPlaceholders, content: c = runContent, id = 'automation-run', className }: AutomationRunProps) {
	const rootRef = useRef<HTMLElement>(null)
	const stageRef = useRef<HTMLDivElement>(null)
	const noteRef = useRef<HTMLDivElement>(null)
	const headRef = useRef<HTMLHeadingElement>(null)
	const cardRefs = useRef<(HTMLLIElement | null)[]>([])
	const api = useRef<RunApi | null>(null)
	const [shown, setShown] = useState<number | null>(null)
	const [noted, setNoted] = useState<number | null>(null)

	useEffect(() => {
		const root = rootRef.current
		const stage = stageRef.current
		const note = noteRef.current
		const head = headRef.current
		const cards = cardRefs.current.slice(0, items.length).filter((li): li is HTMLLIElement => li !== null)
		if (!root || !stage || !note || !head || cards.length !== items.length) return
		const run = startRun({ root, stage, note, head, cards, setShown, setNoted })
		api.current = run
		return () => {
			run.stop()
			api.current = null
		}
	}, [items])

	const ad = noted === null ? null : items[noted]
	const s = ad ? runStats(ad, c.reportDay) : null

	return (
		<section ref={rootRef} id={id} aria-labelledby={`${id}-heading`} data-ds="automation-run" className={cn('ds-run relative grid overflow-x-clip pb-[calc(var(--ds-layout-section)-var(--ds-space-md))] text-fg', className)} style={{ '--n': items.length } as CSSProperties}>
			<style href="ds-automation-run" precedence="ds">{runCss}</style>
			<div className="relative mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter) pt-(--ds-layout-section)">
				<h2 ref={headRef} id={`${id}-heading`} className="ds-run-request type-section">{c.request}</h2>
			</div>
			<div ref={stageRef} className="ds-run-stage">
				<ul className="ds-run-list" aria-label={c.label}>
					{items.map((a, i) => (
						<li key={`${a.brand}-${a.title}-${i}`} ref={(el) => { cardRefs.current[i] = el }} className="ds-run-card" style={{ '--i': i } as CSSProperties}>
							<div data-push="" className="ds-run-layer">
								<div data-lift="" className="ds-run-layer">
									<button
										type="button"
										className="ds-run-face"
										data-tone={a.src || a.video ? undefined : a.tone ?? (i % 4) + 1}
										aria-label={`${a.brand}, ${a.title}`}
										aria-describedby={`${id}-facts-${i}`}
										aria-expanded={shown === i}
										onClick={(e) => {
											if (e.detail > 0 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
											api.current?.setTapped(shown === i ? null : i)
										}}
										onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) api.current?.setFocused(i) }}
										onBlur={() => api.current?.setFocused(null)}
									>
										{a.video ? <video src={a.video} poster={a.src} muted loop autoPlay playsInline preload="metadata" draggable={false} /> : a.src ? <img src={a.src} alt="" draggable={false} /> : null}
									</button>
								</div>
							</div>
							<p id={`${id}-facts-${i}`} className="sr-only">{[a.alt, ...(a.facts ?? [])].filter(Boolean).join('. ')}.</p>
						</li>
					))}
				</ul>
				<div ref={noteRef} className="ds-run-note" data-words={noted ?? undefined} aria-hidden="true">
					{ad && s ? (
						<>
							<div className="flex items-center gap-3">
								<span className="ds-run-thumb size-10 flex-none rounded-ds-sm" data-tone={ad.src ? undefined : ad.tone ?? (noted! % 4) + 1}>{ad.src ? <img src={ad.src} alt="" /> : null}</span>
								<p className="m-0 grid min-w-0 flex-1">
									<span className="type-ui-strong text-fg">{ad.brand}</span>
									<span className="truncate type-caption text-fg-muted">{ad.title}</span>
								</p>
								<span className={cn('inline-flex h-6 flex-none items-center gap-1 rounded-ds-sm border border-edge px-2 type-caption text-fg-soft', s.live && 'ds-run-live')}>{s.status}</span>
							</div>
							<dl className="m-0 mt-3 grid grid-cols-2 border-y border-edge py-3">
								<div>
									<dt className="truncate type-caption text-fg-muted">{s.first[0]}</dt>
									<dd className="m-0 mt-1 text-ui leading-8 text-fg"><span className="font-heading text-[length:var(--ds-space-2xl)] tracking-(--ds-ent-run-big-tracking)">{s.big}</span>{s.bigUnit}</dd>
								</div>
								<div className="border-l border-edge pl-3">
									<dt className="truncate type-caption text-fg-muted">{s.first[1]}</dt>
									<dd className="m-0 mt-1 text-ui leading-8 text-fg">{s.second}</dd>
								</div>
							</dl>
							{s.why.length ? (
								<ul role="list" className="m-0 mt-3 flex list-none flex-wrap gap-1 p-0">
									{s.why.map((f) => <li key={f} className="rounded-ds-sm bg-surface-raised px-2 text-caption leading-6 text-fg">{f}</li>)}
								</ul>
							) : null}
							<ul role="list" className="m-0 mt-3 flex list-none flex-wrap gap-1 p-0 font-code">
								<li className="rounded-ds-sm px-2 text-caption leading-6 text-fg-muted outline-1 -outline-offset-1 outline-edge">{s.source}</li>
								{ad.media ? <li className="rounded-ds-sm px-2 text-caption leading-6 text-fg-muted outline-1 -outline-offset-1 outline-edge">media/{ad.media.slice(0, 8)}</li> : null}
							</ul>
						</>
					) : null}
				</div>
			</div>
		</section>
	)
}

export default AutomationRun
