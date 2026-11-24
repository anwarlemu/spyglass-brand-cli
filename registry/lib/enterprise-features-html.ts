// The enterprise features' sketches as markup, one builder per card, so both flavors render the same tree (React sets
// it as inner HTML, the element through unsafeHTML). Every text is escaped; images and marks come from the content.
import { DATA_DASHES, TOOL_AXIS, WIRES, reportBox, toolColumn, toolWinner, type EnterpriseFeaturesContent, type FeatureKey, type FeatureMark, type FeatureShot } from '@/lib/enterprise-features'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const styleOf = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `${k}: ${v}`).join('; ')

/** A picture: the image, or the neutral gradient. */
const shot = (s: FeatureShot, i: number, extra = '') => `<span class="${['ds-ef-shade', extra].filter(Boolean).join(' ')}" data-tone="${s.src ? '' : s.tone ?? (i % 4) + 1}">${s.src ? `<img src="${esc(s.src)}" alt="" draggable="false"${s.crop ? ` style="object-position: ${esc(s.crop)}"` : ''}>` : ''}</span>`
/** A mark: drawn White through a mask from its image, or its first letter. */
const mark = (m: FeatureMark, cls: string) => (m.mark ? `<span class="${cls}" style="--mark: url(&quot;${esc(m.mark)}&quot;)"></span>` : `<span class="ds-ef-initial" aria-hidden="true">${esc(m.name.charAt(0).toUpperCase())}</span>`)

const cell = (g: string, path: string, dash = false) => `<span class="ds-ef-glyphs ds-ef-data-cell"${dash ? ' data-dash=""' : ''}>${g}<span class="ds-ef-data-lit" data-path="${path}">${g}</span></span>`
const dashes = (path: string) => Array.from({ length: DATA_DASHES }, () => cell('-', path, true)).join('')

const SKETCH: Record<FeatureKey, (c: EnterpriseFeaturesContent) => string> = {
	data: ({ data: A }) => `<div class="ds-ef-center"><div class="ds-ef-data">
<div class="ds-ef-data-branch"><span class="ds-ef-data-turn">${cell('+', 'q')}</span>${dashes('q')}<span class="ds-ef-chip ds-ef-data-ask">${esc(A.question)}</span></div>
<div class="ds-ef-data-drop">${cell(':', 'q')}${cell(':', 'q')}</div>
<div class="ds-ef-data-row"><span class="ds-ef-data-hub"><span class="ds-ef-data-hub-glyph"></span></span>${A.tools.map((t) => `<span class="ds-ef-data-link">${dashes('row')}<span class="ds-ef-data-tool"><span class="ds-ef-client">${mark(t, 'ds-ef-client-glyph')}</span><span class="ds-ef-data-name">${esc(t.label ?? t.name)}</span></span></span>`).join('')}</div>
<div class="ds-ef-data-drop">${cell(':', 'a')}${cell(':', 'a')}</div>
<div class="ds-ef-data-branch"><span class="ds-ef-data-turn">${cell('+', 'a')}</span>${dashes('a')}<span class="ds-ef-chip ds-ef-data-answer">${esc(A.answer)}<span class="ds-ef-data-answer-lit" data-answer="">${esc(A.answer)}</span></span></div>
</div></div>`,
	archive: ({ archive: A }) => {
		const first = A.records.length
		const lit = A.records.filter((r) => r.picked).length
		const place = (i: number) => (i < first ? 'above' : i < first + lit ? 'picked' : 'below')
		const column = [0, 1, 2].flatMap(() => A.records)
		return `<div class="ds-ef-center"><div class="ds-ef-archive">
<div class="ds-ef-archive-head"><span class="ds-ef-archive-source"><span class="ds-ef-chip ds-ef-live">${esc(A.live)}</span><span class="ds-ef-chip ds-ef-archive-meta">${esc(A.source)}</span></span><span class="ds-ef-chip ds-ef-archive-meta">${esc(A.scope)}</span></div>
<div class="ds-ef-stream"><ul class="ds-ef-rows" style="--archive-rest: ${first + lit}" role="list" data-strip="" data-count="${first}">${column.map((r, i) => `<li class="ds-ef-row" data-row="" data-place="${place(i)}"><span class="ds-ef-thumb">${shot(r.shot, i)}</span><span class="ds-ef-row-text"><span class="ds-ef-row-brand">${esc(r.brand)}</span><span class="ds-ef-row-meta">${esc(r.meta)}</span></span><span class="ds-ef-status"><span class="${r.live ? 'ds-ef-chip ds-ef-live' : 'ds-ef-chip'}">${esc(r.status)}</span></span></li>`).join('')}</ul></div>
<div class="ds-ef-app"><span class="ds-ef-app-ground" data-app-ground=""></span><span class="ds-ef-app-head" data-app-head=""><span>${esc(A.app)}</span><span><span class="ds-ef-app-value">${esc(A.stat.value)}</span> ${esc(A.stat.label)}</span></span><span class="ds-ef-chip ds-ef-draft" data-draft="">${esc(A.draft)}</span></div>
</div></div>`
	},
	agents: ({ agents: A }) => `<div class="ds-ef-center"><div class="ds-ef-agents">
<div class="ds-ef-clients">${A.clients.map((c) => `<span class="ds-ef-client" data-mark="">${mark(c, 'ds-ef-client-glyph')}</span>`).join('')}</div>
<span class="ds-ef-glyphs ds-ef-wires" aria-hidden="true">${WIRES.map((glyphs, i) => glyphs.map((g) => `<span class="ds-ef-wire-glyph" style="transform: translate(${g.x - 4}px, ${g.y - 8}px)" data-wire="${i}">${g.g}</span>`).join('')).join('')}</span>
<span class="ds-ef-hub"><span class="ds-ef-hub-glyph"></span></span><span class="ds-ef-chip ds-ef-hub-chip">${esc(A.hub)}</span>
</div></div>`,
	engineers: ({ engineers: A }) => {
		const arrow = '<svg class="ds-ef-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.4 2.1 14 6.6 8.7 8.7 6.6 14z"></path></svg>'
		return `<div class="ds-ef-center"><div class="ds-ef-build" data-build="">
<ol class="ds-ef-flow" role="list">${A.steps.map((s, i) => `<li class="ds-ef-flow-item">${i > 0 ? '<span class="ds-ef-glyphs ds-ef-link" data-link=""><span class="ds-ef-link-across">---</span><span class="ds-ef-link-down">:</span></span>' : ''}<span class="ds-ef-step" data-step="">${esc(s)}</span></li>`).join('')}</ol>
<span class="ds-ef-cursor ds-ef-cursor-you" data-you="">${arrow}<span class="ds-ef-cursor-tag">${esc(A.you)}</span></span>
<span class="ds-ef-cursor ds-ef-cursor-us" data-us="">${arrow}<span class="ds-ef-cursor-tag">${esc(A.us)}</span></span>
</div></div>`
	},
	builds: ({ builds: A }) => {
		const tabs = [A.dashboard.tab, A.creators.tab, A.hooks.tab]
		const top = A.dashboard.rows[0].value
		const check = '<svg class="ds-ef-build-check" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5"></path></svg>'
		return `<div class="ds-ef-center"><div class="ds-ef-builds">
<div class="ds-ef-build-tabs" aria-hidden="true">${tabs.map((t) => `<span class="ds-ef-build-tab">${esc(t)}<span class="ds-ef-build-tab-lit" data-tab="">${esc(t)}</span></span>`).join('')}</div>
<div class="ds-ef-build-stage"><div class="ds-ef-build-body">
<div class="ds-ef-build-panel" data-panel=""><span class="ds-ef-build-caption">${esc(A.dashboard.caption)}</span><ul class="ds-ef-build-list" role="list">${A.dashboard.rows.map((r, i) => `<li class="ds-ef-bar-row"><span class="ds-ef-bar-label">${esc(r.label)}</span><span class="ds-ef-bar-track"><span class="ds-ef-bar-fill"${i === 0 ? ' data-top=""' : ''} style="width: ${(r.value / top) * 100}%"></span></span><span class="ds-ef-bar-value">${r.value}%</span></li>`).join('')}</ul></div>
<div class="ds-ef-build-panel" data-panel=""><span class="ds-ef-build-caption">${esc(A.creators.caption)}<span class="ds-ef-build-tool">${A.creators.tool.mark ? `<span class="ds-ef-build-tool-mark" style="--mark: url(&quot;${esc(A.creators.tool.mark)}&quot;)" aria-hidden="true"></span>` : ''}${esc(A.creators.tool.name)}</span></span><ul class="ds-ef-build-list" role="list">${A.creators.rows.map((r) => `<li class="ds-ef-creator-row"><span class="ds-ef-build-avatar">${r.avatar ? `<img src="${esc(r.avatar)}" alt="" width="32" height="32">` : esc(r.name.charAt(1).toUpperCase())}</span><span class="ds-ef-creator-text"><span class="ds-ef-creator-name">${esc(r.name)}</span><span class="ds-ef-creator-note">${esc(r.note)}</span></span>${check}</li>`).join('')}</ul></div>
<div class="ds-ef-build-panel" data-panel=""><div class="ds-ef-hook-flow"><span class="ds-ef-review">${esc(A.hooks.review)}</span><span class="ds-ef-creator-note">${esc(A.hooks.source)}</span><span class="ds-ef-glyphs ds-ef-hook-link" aria-hidden="true">:<br>:</span><span class="ds-ef-chip ds-ef-hook-chip">${esc(A.hooks.hook)}</span><span class="ds-ef-hook-rivals"><span class="ds-ef-hook-ads">${A.hooks.ads.map((s, i) => `<span class="ds-ef-hook-ad">${shot(s, i)}</span>`).join('')}</span><span class="ds-ef-creator-note">${esc(A.hooks.rivals)}</span></span></div></div>
</div></div>
</div></div>`
	},
	tools: ({ tools: A }) => {
		const win = toolWinner(A.options)
		const lit = (text: string, top: boolean) => (top ? `${esc(text)}<span class="ds-ef-tool-text-lit" data-lit="">${esc(text)}</span>` : esc(text))
		const column = (rows: number, top: boolean) => {
			const g = toolColumn(rows, top)
			return `<span class="ds-ef-glyphs ds-ef-tool-stack">${g.map((x) => `<span data-row="">${x}</span>`).join('')}${top ? `<span class="ds-ef-tool-stack-lit" data-lit="">${g.join('&#10;')}</span>` : ''}</span>`
		}
		return `<div class="ds-ef-center"><div class="ds-ef-tools">
<span class="ds-ef-chip ds-ef-tool-ask">${esc(A.request)}</span>
<div class="ds-ef-tool-panel" data-tool-panel=""><span class="ds-ef-tool-head"><span class="ds-ef-tool-name">${esc(A.name)}</span><span class="ds-ef-tool-metric">${esc(A.metric)}</span></span><div class="ds-ef-tool-chart">${A.options.map((o, i) => `<span class="ds-ef-tool-col" data-col=""><span class="ds-ef-tool-value" data-value="">${lit(o.value, i === win)}</span>${column(o.rows, i === win)}</span>`).join('')}<span class="ds-ef-glyphs ds-ef-tool-axis">${TOOL_AXIS}</span>${A.options.map((o, i) => `<span class="ds-ef-tool-label">${lit(o.label, i === win)}</span>`).join('')}</div></div>
<span class="ds-ef-tool-tag" data-tag="">${A.tag.map((t, i) => `<span class="${i > 0 ? 'ds-ef-chip ds-ef-tool-by' : 'ds-ef-chip'}">${esc(t)}</span>`).join('')}</span>
</div></div>`
	},
	reports: ({ reports: R }) => `<div class="ds-ef-reports">
${R.messages.map((msg, m) => msg.ads.map((ad, c) => `<div class="ds-ef-report-layer" data-layer="" data-m="${m}" data-c="${c}"${m === 0 ? '' : ' data-wait=""'}><span class="ds-ef-report-ad" style="${styleOf(reportBox(m, c))}">${shot(ad, m * 2 + c, 'ds-ef-report-img')}<span class="ds-ef-chip ds-ef-report-tag">${esc(ad.tag)}</span></span></div>`).join('')).join('')}
<div class="ds-ef-bar-anchor"><div class="ds-ef-bar" data-bar=""><span class="ds-ef-bar-well"><span class="ds-ef-bar-glyph"></span></span><span class="ds-ef-bar-labels">${R.messages.map((x) => `<span class="ds-ef-bar-sizer">${esc(x.text)}</span>`).join('')}${R.messages.map((x, m) => `<span class="ds-ef-bar-label" data-label="" data-m="${m}"${m === 0 ? '' : ' data-off=""'}>${esc(x.text)}</span>`).join('')}</span><span class="ds-ef-bar-channel ds-ef-bar-labels">${R.messages.map((x) => `<span class="ds-ef-bar-sizer">${esc(x.channel)}</span>`).join('')}${R.messages.map((x, m) => `<span data-label="" data-m="${m}"${m === 0 ? '' : ' data-off=""'}>${esc(x.channel)}</span>`).join('')}</span></div></div>
</div>`,
	alpha: ({ alpha: A }) => `<div class="ds-ef-a-stage"><div class="ds-ef-a-alpha">
<div class="ds-ef-a-zone"><span class="ds-ef-a-label">${esc(A.workspace)}</span><div class="ds-ef-a-ads">${A.shots.map((s, i) => `<span class="ds-ef-a-ad">${shot({ crop: '50% 35%', ...s }, i)}</span>`).join('')}</div><span class="ds-ef-a-exchange"><span class="ds-ef-a-ask" data-ask="">${esc(A.ask)}</span><span class="ds-ef-a-answer" data-answer="">${esc(A.answer)}</span></span></div>
<div class="ds-ef-a-zone"><span class="ds-ef-a-label ds-ef-a-spyglass"><span class="ds-ef-a-mark"></span>${esc(A.product)}</span><div class="ds-ef-a-slots">${A.shots.map((s, i) => `<span class="ds-ef-a-slot"><span class="ds-ef-a-copy" data-copy=""><span class="ds-ef-a-layer" data-sharp="">${shot({ crop: '50% 35%', ...s }, i)}</span><span class="ds-ef-a-layer ds-ef-a-blurred" data-blurred="">${shot({ crop: '50% 35%', ...s }, i)}</span></span></span>`).join('')}</div><span class="ds-ef-a-status"><span class="ds-ef-a-answering" data-answering="">${esc(A.answering)}</span><span class="ds-ef-a-deleted" data-deleted="">${esc(A.deleted)}</span></span></div>
</div></div>`,
}

/** One card's sketch, as markup. */
export const featureSketch = (key: FeatureKey, c: EnterpriseFeaturesContent) => SKETCH[key](c).replace(/\n/g, '')
