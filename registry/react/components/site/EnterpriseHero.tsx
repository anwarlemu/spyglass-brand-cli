'use client'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Button } from '@/react/components/ui/Button'
import { ASCII_TEXTURE } from '@/lib/textures'
import { placeRingTag, ringAspect, ringCardLabel, ringCss, ringIntent, ringPlaceStyle, ringPlaceholders, watchRing, RING_PLACES, type RingCard } from '@/lib/enterprise-ring'
import { enterpriseHeroContent, type EnterpriseHeroContent } from '@/lib/pages/enterprise'
import { cn } from '@/react/lib/cn'

// The site's enterprise hero (pages/Enterprise EnterprisePage .hero and HeroRing): at least the window's height less the
// header (640px at the least), the headline in the section head (its first line kept whole from 768), the lead and two
// buttons centered, and twelve creatives around them (ten from 768, six on phones, sized to the room). Each card rises
// in (40ms apart), then bobs 8px on a 6s loop while the hero is on screen; under a mouse (after 80ms), on focus or a tap it
// comes forward to 1.1 with a tag (its hook and how long it ran) placed below, above or inside where it fits; a press
// shows the next creative in its set, announced politely. Every 6s, while nobody touches it, one card comes forward
// for 2s. From 1024 two tiles of the ASCII texture sit at the sides, cleared around the words. Reduced motion keeps the
// cards still. `cards` takes your creatives (sets of RingCard, clockwise from the top left); without `src` a card is a
// neutral gradient.
export interface EnterpriseHeroProps {
	content?: EnterpriseHeroContent
	/** Twelve sets of creatives, clockwise from the top left. */
	cards?: RingCard[][]
	/** The section's id (the heading is `<id>-heading`). */
	id?: string
	className?: string
}

export function EnterpriseHero({ content: c = enterpriseHeroContent, cards = ringPlaceholders, id = 'enterprise', className }: EnterpriseHeroProps) {
	const sets = cards.slice(0, RING_PLACES.length)
	const [at, setAt] = useState<number[]>(() => sets.map(() => 0))
	const [stepped, setStepped] = useState<boolean[]>(() => sets.map(() => false))
	const [shown, setShown] = useState<number | null>(null)
	const [hint, setHint] = useState<number | null>(null)
	const [said, setSaid] = useState('')
	const [held, setHeld] = useState<number | null>(null)
	const sectionRef = useRef<HTMLElement>(null)
	const ringRef = useRef<HTMLUListElement>(null)
	const places = useRef(new Map<number, HTMLLIElement>())
	const pointer = useRef('mouse')
	const intent = useRef(0)
	const busy = useRef(false)

	const forward = shown ?? hint
	if (forward !== null && forward !== held) setHeld(forward)

	const next = (i: number) => {
		const n = sets[i].length
		const to = ((at[i] ?? 0) + 1) % n
		setAt((prev) => sets.map((_, j) => (j === i ? to : prev[j] ?? 0)))
		setStepped((prev) => sets.map((_, j) => (j === i ? true : prev[j] ?? false)))
		const card = sets[i][to]
		setSaid(`${to + 1} of ${n} with this hook: ${card.brand}, ${card.title}.`)
	}

	useLayoutEffect(() => {
		const el = held === null ? null : places.current.get(held)
		if (el && sectionRef.current) placeRingTag(el, sectionRef.current)
	}, [held, at, stepped])

	useEffect(() => {
		busy.current = shown !== null
	}, [shown])

	useEffect(() => {
		const ring = ringRef.current
		const section = sectionRef.current
		if (!ring || !section) return
		const watch = watchRing(ring, section, () => busy.current, setHint)
		const onDown = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse' && !(e.target as HTMLElement).closest('[data-ring-card]')) setShown(null)
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setShown(null)
		}
		section.addEventListener('pointerdown', onDown)
		section.addEventListener('keydown', onKey)
		return () => {
			watch.stop()
			section.removeEventListener('pointerdown', onDown)
			section.removeEventListener('keydown', onKey)
			window.clearTimeout(intent.current)
		}
	}, [])

	return (
		<section ref={sectionRef} id={id} aria-labelledby={`${id}-heading`} data-ds="enterprise-hero" className={cn('ds-ent-hero relative grid items-center overflow-x-clip bg-surface text-fg', className)}>
			<style href="ds-enterprise-hero" precedence="ds">{ringCss}</style>
			<div className="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)">
				<div data-ring-words="" className="relative z-2 mx-auto flex max-w-(--ds-ent-hero-head-w) flex-col items-center gap-6 text-center">
					<h1 id={`${id}-heading`} className="max-w-(--ds-ent-hero-title-w) type-section"><span className="ds-ent-hero-keep">{c.title[0]}</span> {c.title[1]}</h1>
					<p className="type-body-lg text-fg-soft">{c.lead}</p>
					<div className="flex flex-col flex-wrap justify-center gap-3 self-stretch md:flex-row md:self-auto">
						<Button href={c.primary.href}>{c.primary.label}</Button>
						<Button href={c.secondary.href} variant="secondary">{c.secondary.label}</Button>
					</div>
				</div>
			</div>
			<span aria-hidden="true" className="ds-ent-hero-ascii" style={{ backgroundImage: `url("${ASCII_TEXTURE}"), url("${ASCII_TEXTURE}")` }} />
			<ul ref={ringRef} className="ds-ring" aria-label={c.label} data-run="false">
				{sets.map((set, i) => {
					const card = set[at[i] ?? 0]
					if (!card) return null
					const slot = RING_PLACES[i]
					return (
						<li
							key={i}
							ref={(el) => { if (el) places.current.set(i, el); else places.current.delete(i) }}
							data-ring-place=""
							className="ds-ring-place"
							data-wide={slot.wide ? '' : undefined}
							data-phone={slot.phone ? '' : undefined}
							data-forward={forward === i ? '' : undefined}
							style={ringPlaceStyle(i) as CSSProperties}
						>
							<button
								type="button"
								className="ds-ring-card"
								data-ring-card=""
								aria-label={ringCardLabel(card, at[i] ?? 0, set.length)}
								onPointerDown={(e) => { pointer.current = e.pointerType }}
								onKeyDown={() => { pointer.current = 'keyboard' }}
								onPointerEnter={(e) => {
									if (e.pointerType !== 'mouse') return
									window.clearTimeout(intent.current)
									intent.current = window.setTimeout(() => setShown(i), ringRef.current ? ringIntent(ringRef.current) : 0)
								}}
								onPointerLeave={(e) => {
									if (e.pointerType !== 'mouse') return
									window.clearTimeout(intent.current)
									setShown((s) => (s === i ? null : s))
								}}
								onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setShown(i) }}
								onBlur={() => setShown((s) => (s === i ? null : s))}
								onClick={() => {
									const touch = pointer.current === 'touch' || pointer.current === 'pen'
									pointer.current = 'mouse'
									setShown(i)
									if (touch && shown !== i) return
									next(i)
								}}
							>
								<span className="ds-ring-frame" style={{ aspectRatio: ringAspect(card.ratio) }} data-tone={card.src ? undefined : card.tone ?? (i % 4) + 1} data-stepped={stepped[i] ? '' : undefined}>
									{card.src ? <img key={card.src} src={card.src} alt="" draggable={false} /> : <span key={`${card.brand}-${card.title}`} className="absolute inset-0 flex items-end p-2"><span className="hidden type-label text-fg md:block">{card.brand}</span></span>}
								</span>
							</button>
							{held === i ? (
								<div className="ds-ring-tag" data-ring-tag="" data-shown={forward === i ? '' : undefined} aria-hidden="true">
									<span>{`Hook: ${card.hook.toLowerCase()}`}</span>
									{card.meta.map((line) => <span key={line} className="text-fg-muted">{line}</span>)}
									{stepped[i] ? <span className="text-fg-muted">{`${(at[i] ?? 0) + 1} of ${set.length} with this hook`}</span> : null}
								</div>
							) : null}
						</li>
					)
				})}
			</ul>
			<p className="sr-only" aria-live="polite">{said}</p>
		</section>
	)
}

export default EnterpriseHero
