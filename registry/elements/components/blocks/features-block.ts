import { html, svg, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/creative-card'
import { ASCII_TEXTURE } from '@/lib/textures'
import { startDemo } from '@/lib/home/demo'
import { startScene } from '@/lib/home/scene'
import { addedLabel, allLabels, burstContent, castTone, LAST, LIVE_CELLS, ringOffset, SHOTS, startAccountsBurst, STILL, unitMove, visibleAt, WELL_FROM, type BurstContent } from '@/lib/home/accounts-burst'
import { buildTally, featuresContent, MEDIA_HOLD, mediaAds, mediaCarry, mediaContent, mediaLayout, mediaRest, mediaShown, mediaTimeline, RING_HOLD, ringContent, ringIconStyle, ringLabelStyle, ringSide, ringTimeline, TALLY_SLOTS, tallyContent, tallyRowAt, type FeaturesContent, type MediaAd, type MediaContent, type RingContent, type TallyContent } from '@/lib/home/features'
import styles from 'virtual:tw'

// FeaturesBlock.tsx as <spyglass-features-block>: the head and four cards whose stages play while on screen (the media
// strip, the accounts burst, the graph ring, the patterns tally), still with reduced motion. `content`, `media`, `ads`,
// `burst`, `ring` and `tally` as JSON.

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const search = (cls: string) => html`<svg class=${cls} viewBox="0 0 16 16" aria-hidden="true">${svg`<circle cx="7" cy="7" r="4.5"></circle><path d="m10.5 10.5 3 3"></path>`}</svg>`
const send = html`<svg class="ds-ft-icon" viewBox="0 0 16 16" aria-hidden="true">${svg`<path d="M8 12.5v-9M4 7.5l4-4 4 4"></path>`}</svg>`
const card = (tone: number, src?: string) => html`<spyglass-creative-card ratio="fill" src=${ifDefined(src)} tone=${tone}></spyglass-creative-card>`

/** @summary The home's features: four stages that show the product working, over their titles. */
export class FeaturesBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="features-block"]'))
	static properties = { content: { type: Object }, media: { type: Object }, ads: { type: Array }, burst: { type: Object }, ring: { type: Object }, tally: { type: Object } }
	content: FeaturesContent = featuresContent
	/** The media strip's search and platform names. */
	media: MediaContent = mediaContent
	/** The strip's ads: { h, ratio, tone, src?, days?, views?, ago? }. */
	ads: MediaAd[] = mediaAds
	/** The accounts burst's searches and rows. */
	burst: BurstContent = burstContent
	/** The graph ring's brand and nodes. */
	ring: RingContent = ringContent
	/** The patterns tally's brand, rows and facts. */
	tally: TallyContent = tallyContent
	private stops: (() => void)[] = []

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stops.forEach((s) => s())
		this.stops = []
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (this.stops.length && !['ads', 'burst', 'ring', 'tally'].some((k) => changed.has(k))) return
		this.stops.forEach((s) => s())
		const q = (s: string) => this.renderRoot.querySelector<HTMLElement>(s)
		const ads = this.ads ?? mediaAds
		const ms = q('[data-media]')
		const ab = q('.ds-ab')
		const gr = q('[data-graph]')
		const tl = q('.ds-ft-tally')
		this.stops = [
			ms && startDemo(ms, mediaTimeline(mediaCarry(mediaLayout(ads.map((a) => a.h * a.ratio)).slots))),
			ab && startAccountsBurst(ab, (this.burst ?? burstContent).searches),
			gr && startDemo(gr, ringTimeline((this.ring ?? ringContent).nodes)),
			tl && startScene(tl, buildTally(this.tally ?? tallyContent)),
		].filter((s): s is () => void => !!s)
	}

	private stage(title: string, body: string, at: string, inner: unknown) {
		return html`<li class="ds-ft-card"><div class="ds-ft-text"><h3 class="ds-ft-title">${title}</h3><p class="ds-ft-body">${body}</p></div><div class="ds-ft-stage"><span class="ds-ft-ascii" aria-hidden="true" style=${`--ascii-at: ${at}; background-image: url("${ASCII_TEXTURE}")`}></span>${inner}</div></li>`
	}

	private mediaStrip() {
		const m = this.media ?? mediaContent
		const ads = this.ads ?? mediaAds
		const widths = ads.map((a) => a.h * a.ratio)
		const { lefts, slots } = mediaLayout(widths)
		const cam = mediaCarry(slots)
		return html`<div class="ds-ft-demo" data-media=""><div class="ds-ft-canvas" aria-hidden="true" inert><div class="ds-ms"><div class="ds-ms-field"><div class="ds-ms-row" data-row="" style=${`--at: ${mediaRest(cam)}cqw`}>${ads.map((ad, i) => html`<div class="ds-ms-ad" data-ad="" style=${`--x: ${lefts[i].toFixed(2)}; --w: ${widths[i].toFixed(2)}; --h: ${ad.h}${mediaShown(i, MEDIA_HOLD) ? '' : '; opacity: 0'}`}>${card(ad.tone, ad.src)}<span class="ds-ms-tags">${(ad.views ? [m.views.replace('{n}', ad.views), m.ago.replace('{n}', String(ad.ago ?? 0))] : [m.days.replace('{n}', String(ad.days ?? 0))]).map((l) => html`<span class="ds-ms-days">${l}</span>`)}</span></div>`)}</div></div><div class="ds-ms-dock"><div class="ds-ms-prompt">${search('ds-ft-icon')}<span class="ds-ms-query">${m.query}</span><span class="ds-ms-sources"><span class="ds-ms-scope"><span class="ds-ms-across">${m.across}</span>${m.live.join(', ')}</span><span class="ds-ms-scope ds-ms-soon">${m.soon} +${m.later.length}</span></span><span class="ds-ms-send">${send}</span></div></div></div></div><p class="sr-only">${m.summary}</p></div>`
	}

	private chip(label: string, labels: string[], ai: string, live = false) {
		return html`<span class="ds-ab-well" data-ab-well=${ifDefined(live ? '' : undefined)} style=${`transform: scale(${WELL_FROM.toFixed(4)})`}>${search('ds-ab-icon')}</span><span class="ds-ab-labels">${labels.map((l) => html`<span class="ds-ab-sizer">${l}</span>`)}<span class="ds-ab-label" data-ab-label=${ifDefined(live ? '' : undefined)}>${label}</span></span><span class="ds-ab-ai">${ai}</span>`
	}

	private accountsBurst() {
		const c = this.burst ?? burstContent
		const still = new Set(visibleAt(STILL))
		const labels = allLabels(c.searches)
		return html`<div class="ds-ab"><div class="ds-ab-canvas" aria-hidden="true">${c.searches.map((s, q) => SHOTS.map(([slot, , , w, h], i) => {
			const on = q === 0 && still.has(i)
			const [dx, dy] = ringOffset(i, STILL)
			return html`<span class="ds-ab-shot" data-shot=${`${q}-${i}`} data-still=${ifDefined(on ? '' : undefined)} style=${`--w: ${w}; --h: ${h}; z-index: ${slot + 1}${on ? `; transform: ${unitMove(dx, dy)}` : ''}`}>${card(castTone(s, i))}</span>`
		}))}<div class="ds-ab-anchor"><div class="ds-ab-chip ds-ab-ground" data-ab-chip="">${this.chip(c.searches[0].scrub[0], labels, c.aiLabel, true)}</div></div>${c.searches.map((s, q) => html`<div class="ds-ab-anchor"><div class="ds-ab-box" data-box=${q} data-still=${ifDefined(q === 0 ? '' : undefined)}><span data-k="pic" class="ds-ab-pic" style="opacity: 0">${card(castTone(s, LAST))}</span><span data-k="row" class="ds-ab-row-face"><span class="ds-ab-row"><span class="ds-ab-head"><span class="ds-ab-logo">${s.row.logo ? html`<img src=${s.row.logo} alt="">` : s.row.name.replace(/^Acme /, '').slice(0, 1)}</span><span class="ds-ab-who"><span class="ds-ab-strong">${s.row.name}</span><span class="ds-ab-sub">${s.row.category}</span></span></span><span class="ds-ab-stats"><span class="ds-ab-stat"><span class="ds-ab-strong">${s.row.instagram}</span><span class="ds-ab-sub">${c.columns.instagram}</span></span><span class="ds-ab-stat"><span class="ds-ab-strong">${s.row.tiktok ?? html`<span class="ds-ab-dash"></span>`}</span><span class="ds-ab-sub">${c.columns.tiktok}</span></span><span class="ds-ab-stat"><span class="ds-ab-strong">${s.row.activeAds.toLocaleString('en-US')}</span><span class="ds-ab-sub">${c.columns.meta}</span></span></span></span><span class="ds-ab-live" data-k="live" data-state="added"><span class="ds-ab-status"><span class="ds-ab-searching">${c.searching}</span><span class="ds-ab-added">${addedLabel(c, s.added)}</span></span><span class="ds-ab-bar"><span data-k="lit" class="ds-ab-lit">${'#'.repeat(LIVE_CELLS)}</span><span data-k="unlit" class="ds-ab-unlit"></span></span></span></span><span data-k="chip" class="ds-ab-chip ds-ab-chip-face" style="opacity: 0">${this.chip(c.searches[(q + 1) % c.searches.length].scrub[0], labels, c.aiLabel)}</span></div></div>`)}</div><div class="sr-only">${c.searches.map((s) => html`<p>${`Searching brands for "${s.query}" returns ${s.row.name}, ${s.row.category}: ${s.row.instagram} Instagram followers, ${s.row.activeAds.toLocaleString('en-US')} active ads. The live search adds ${s.added} new accounts to the archive.`}</p>`)}</div></div>`
	}

	private graphRing() {
		const c = this.ring ?? ringContent
		return html`<div class="ds-ft-demo" data-graph=""><div class="ds-ft-canvas" aria-hidden="true" inert><div class="ds-gr"><div class="ds-gr-ring">${[...c.nodes].reverse().map((n) => html`<span class="ds-gr-node" data-node=${n.key} style=${`transform: ${ringIconStyle(n, RING_HOLD).transform}`}>${n.look === 'mark' ? html`<span class="ds-gr-mark">${c.brand.slice(0, 1)}</span>` : n.look === 'page' ? html`<span class="ds-gr-page"><span class="ds-gr-bar"><span class="ds-gr-dot" data-dot="close"></span><span class="ds-gr-dot" data-dot="min"></span><span class="ds-gr-dot" data-dot="full"></span></span><span class="ds-gr-shot">${card(n.tone ?? 2, n.src)}</span></span>` : html`<span class=${n.look === 'face' ? 'ds-gr-face' : 'ds-gr-post'}>${card(n.tone ?? 2, n.src)}</span>`}</span>`)}${c.nodes.map((n) => {
			const rest = ringLabelStyle(n, RING_HOLD)
			const side = ringSide(n.angle)
			return html`<span class="ds-gr-label" data-label=${n.key} style=${`transform: ${rest.transform}; opacity: ${rest.opacity}`}><span class="ds-gr-text" data-v=${side.v} data-h=${side.h}><span class="ds-gr-kind">${n.kind}</span><span class="ds-gr-source">${n.source}</span></span></span>`
		})}</div></div></div><p class="sr-only">${c.summary}</p></div>`
	}

	private patternsTally() {
		const c = this.tally ?? tallyContent
		return html`<div class="ds-ft-tally"><div class="ds-tl" aria-hidden="true" inert><div class="ds-tl-reel" data-reel=""><div class="ds-tl-strip" data-strip="">${TALLY_SLOTS.map((k) => {
			const row = c.rows[tallyRowAt(k, c.rows.length)]
			return html`<div class="ds-tl-card" data-card="">${card(row.tone, row.src)}</div>`
		})}</div><div class="ds-tl-frame" data-frame=""><span class="ds-tl-brackets" data-brackets=""><i></i><i></i><i></i><i></i></span><span class="ds-tl-facts" data-facts="">${c.facts.map((f, i) => html`<span class="ds-tl-fact" style=${ifDefined(i ? 'opacity: 0' : undefined)} data-fact=""><span class="ds-tl-full">${f.full}</span><span class="ds-tl-short">${f.short}</span></span>`)}</span></div></div><div class="ds-tl-side"><p class="ds-tl-head"><span class="ds-tl-logo">${c.brand.slice(0, 1)}</span><span class="ds-tl-brand">${c.brand}</span><span class="ds-tl-meta">${c.meta}</span></p><ol class="ds-tl-rows">${c.rows.map((row) => html`<li class="ds-tl-row" data-row=""><span class="ds-tl-name">${row.name}</span><span class="ds-tl-count">${row.total}</span><span class="ds-tl-ruler" data-ruler=""><span class="ds-tl-fill" data-fill=""></span><span class="ds-tl-hot" data-hot=""></span><span class="ds-tl-rest" data-rest=""></span></span></li>`)}</ol><p class="ds-tl-scale"><span data-per="">${c.per.replace('{n}', '2')}</span><span>${c.ads.replace('{n}', String(c.of))}</span></p></div>${c.rows.map(() => html`<span class="ds-tl-leader" data-leader=""></span>`)}</div><p class="sr-only">${c.summary}</p></div>`
	}

	render() {
		const c = this.content ?? featuresContent
		return html`<section data-ds="features-block" class="py-(--ds-layout-section) text-fg"><div class=${CONTAINER}><header class="ds-ft-head mb-16 flex flex-col items-center text-center lg:mb-20"><h2 class="type-section">${c.headline}</h2><p class="mt-6 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${c.lead}</p></header><ul class="ds-ft-grid" role="list">${this.stage(c.media.title, c.media.body, '40% 24%', this.mediaStrip())}${this.stage(c.accounts.title, c.accounts.body, '0 0', this.accountsBurst())}${this.stage(c.entity.title, c.entity.body, '20% 80%', this.graphRing())}${this.stage(c.patterns.title, c.patterns.body, '64% 56%', this.patternsTally())}</ul></div></section>`
	}
}

define('features-block', FeaturesBlock)

