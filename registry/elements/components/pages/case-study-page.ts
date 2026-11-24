import { html, nothing, svg } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { asciiDriftStyle, type AsciiDriftCrop, type AsciiDriftFrom } from '@/lib/ascii-drift'
import { caseStudies, caseStudyContent, caseStudyMinutes, caseStudyNeighbors, type CaseStudy, type CaseStudyContent } from '@/lib/pages/case-studies'
import '@/elements/components/ui/badge'
import '@/elements/components/site/creative-card'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/ascii-trail'
import styles from 'virtual:tw'

// CaseStudyPage.tsx as <spyglass-case-study-page>: the header, the centered head (breadcrumb, headline, kind and read
// time), the facts, the lead picture, the opening line and figures, the pull quote, the sections and the pager, the
// closing section and the footer; ASCII crops in the margins from 1024. `study` (JSON) picks the study, `content`
// (JSON) the rest (lib/pages/case-studies.ts; its studies set the pager). Links change color; nothing moves.

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const MEASURE = 'mx-auto w-full max-w-[calc(var(--ds-layout-measure)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const HEAD_SIDE = 'w-[calc((100%-880px)/2-64px)]'
const BODY_SIDE = 'w-[calc((100%-var(--ds-layout-measure))/2-64px)]'
const LABEL = 'type-ui text-fg-muted transition-[color] duration-160 ease-out group-hover:text-fg group-focus-visible:text-fg'

const drift = (crop: AsciiDriftCrop, from: AsciiDriftFrom, place: string, hero = false) => html`<span aria-hidden="true" class=${['pointer-events-none absolute -z-1 hidden select-none lg:block', place].join(' ')} style=${asciiDriftStyle(crop, from, hero ? 'hero' : 'quiet')}></span>`
const arrow = (back = false) => html`<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" class="size-4 transition-[color] duration-160 ease-out group-hover:text-fg group-focus-visible:text-fg">${svg`<path d=${back ? 'M13 8H4M7.5 4.5 4 8l3.5 3.5' : 'M3 8h9M8.5 4.5 12 8l-3.5 3.5'} fill="none" stroke="currentColor" stroke-width="1.5"></path>`}</svg>`

/**
 * @summary A case study article.
 */
export class CaseStudyPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="case-study-page"]'))
	static properties = { study: { type: Object }, content: { type: Object } }
	/** The study (the first of lib/pages/case-studies.ts by default). */
	study: CaseStudy = caseStudies[0]
	/** The copy and the studies for the pager. */
	content: CaseStudyContent = caseStudyContent

	render() {
		const c = this.content ?? caseStudyContent
		const s = this.study ?? caseStudies[0]
		const { previous, next } = caseStudyNeighbors(c.studies, s.slug)
		const id = `${s.slug}-heading`
		const cover = s.cover?.src
			? html`<img src=${s.cover.src} alt=${s.cover.alt ?? ''} class="absolute inset-0 block size-full object-cover">`
			: html`<div class="absolute inset-0"><spyglass-creative-card ratio="fill" brand=${s.cover?.brand ?? nothing} tone="2"></spyglass-creative-card></div>`
		const pager = next
			? html`<nav aria-label=${c.labels.more} class=${MEASURE}><div class="flex justify-between gap-6 border-y border-edge py-10">${previous ? html`<a href=${c.href(previous.slug)} class="group grid min-w-0 grid-cols-[16px_auto] items-center gap-x-3 gap-y-2 text-fg-muted">${arrow(true)}<span class=${LABEL}>${c.labels.previous}</span><span class="col-start-2 justify-self-end type-body font-medium text-fg">${previous.company}</span></a>` : html`<span></span>`}<a href=${c.href(next.slug)} class="group grid min-w-0 grid-cols-[auto_16px] items-center gap-x-3 gap-y-2 text-left text-fg-muted"><span class=${LABEL}>${c.labels.next}</span>${arrow()}<span class="col-start-1 justify-self-start type-body font-medium text-fg">${next.company}</span></a></div></nav>`
			: nothing
		return html`<div data-ds="case-study-page" class="isolate overflow-x-clip bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><div class=${CONTAINER}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div><main><article aria-labelledby=${id} class="relative isolate overflow-x-clip"><div class="relative">${drift('column', 'left', `${HEAD_SIDE} top-[8%] left-0 h-[84%]`, true)}${drift('scatter', 'right', `${HEAD_SIDE} top-0 right-0 h-[72%]`, true)}<header class=${[CONTAINER, 'flex flex-col items-center gap-6 pt-20 pb-12 text-center lg:gap-8 lg:pt-40 lg:pb-16'].join(' ')}><nav aria-label="Breadcrumb" class="flex items-center gap-2 type-ui text-fg-muted"><a href=${c.labels.all.href} class="transition-[color] duration-160 ease-out hover:text-fg">${c.labels.all.label}</a><span aria-hidden="true">/</span><span aria-current="page" class="text-fg">${s.company}</span></nav><h1 id=${id} class="max-w-[880px] type-section text-balance">${s.headline}</h1><p class="flex items-center gap-1"><spyglass-badge variant="secondary">${s.kind}</spyglass-badge><spyglass-badge variant="secondary">${c.labels.read(caseStudyMinutes(s))}</spyglass-badge></p></header></div><div class="relative">${drift('mass', 'right', `${BODY_SIDE} -top-8 right-0 h-40`)}<div class=${MEASURE}><dl class="m-0 mb-12 grid grid-cols-2 gap-x-5 gap-y-6 md:mb-16 md:grid-cols-4">${s.facts.map((f) => html`<div class="flex min-w-0 flex-col gap-1"><dt class="type-ui-strong text-fg">${f.label}</dt><dd class="m-0 type-ui text-fg-soft">${f.value}</dd></div>`)}<div class="flex min-w-0 flex-col gap-1"><dt class="type-ui-strong text-fg">${c.labels.uses}</dt><dd class="m-0 type-ui text-fg-soft">${s.uses.map((u, i) => html`<span><a href=${u.href} class="text-fg-soft underline decoration-edge-strong underline-offset-4 transition-[color,text-decoration-color] duration-160 ease-out hover:text-fg hover:decoration-fg">${u.label}</a>${i < s.uses.length - 1 ? ', ' : nothing}</span>`)}</dd></div></dl></div></div><div class=${CONTAINER}><div class="relative aspect-4/5 overflow-hidden rounded-panel bg-surface-raised md:aspect-video">${cover}</div></div><div class="relative">${drift('cluster', 'left', `${BODY_SIDE} top-0 left-0 h-full`)}<div class=${MEASURE}><p class="m-0 mt-16 type-body-lg text-pretty text-fg">${s.lead}</p><ul role="list" class="m-0 mt-12 grid list-none grid-cols-[minmax(0,1fr)] gap-6 border-t border-edge p-0 pt-8 md:grid-cols-3 md:gap-5">${s.figures.map((f) => html`<li class="flex flex-col gap-2"><span class="type-heading-2 text-fg tabular-nums">${f.value}</span><span class="type-ui text-balance text-fg-muted">${f.label}</span></li>`)}</ul></div></div><div class="relative">${drift('scatter', 'right', `${BODY_SIDE} top-[8%] right-0 h-[28%]`)}${drift('column', 'left', `${BODY_SIDE} top-[52%] left-0 h-[30%]`)}<div class=${[MEASURE, 'pt-16 pb-24'].join(' ')}><blockquote class="m-0 flex flex-col gap-4 rounded-panel bg-surface-raised p-8"><p class="m-0 type-heading-4 text-pretty md:type-heading-3 md:text-pretty">“${s.quote.text}”</p><footer class="type-ui text-fg-muted">${s.quote.role ? `${s.quote.name}, ${s.quote.role}` : s.quote.name}</footer></blockquote>${s.sections.map((section, i) => html`<section aria-labelledby=${`${s.slug}-s${i}`} class="mt-24"><h2 id=${`${s.slug}-s${i}`} class="m-0 type-heading-2 text-balance lg:type-heading-1">${section.title}</h2>${section.paragraphs.map((p) => html`<p class="m-0 mt-6 type-body text-pretty text-fg-soft">${p}</p>`)}${i === 1 && s.aside ? html`<blockquote class="m-0 mt-10 flex flex-col gap-4 border-l border-edge-strong pl-6"><p class="m-0 type-heading-4 text-pretty md:type-heading-3 md:text-pretty">“${s.aside.text}”</p><footer class="type-ui text-fg-muted">${s.aside.name}</footer></blockquote>` : nothing}</section>`)}</div></div>${pager}</article><spyglass-page-close .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close></main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('case-study-page', CaseStudyPage)
