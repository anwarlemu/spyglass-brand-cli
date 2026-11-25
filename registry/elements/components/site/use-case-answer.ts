import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { useCaseAnswerCallsLabel, useCaseAnswerChat, type AnswerExample } from '@/lib/use-case-answer'
import '@/elements/components/site/creative-card'
import styles from 'virtual:tw'

// UseCaseAnswer.tsx as <spyglass-use-case-answer>: one question (or, in api mode, the request as code) and the answer
// that came back on the raised panel: the status, the lead, the rows (a creative, a title and detail, a figure), a note
// and the tools called. `example` takes JSON; `calls-label` names the calls. Nothing moves.

/**
 * @summary A question and its answer, as a panel.
 */
export class UseCaseAnswer extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="use-case-answer"]'))
	static properties = { example: { type: Object }, callsLabel: { attribute: 'calls-label' } }
	/** The question and answer (lib/use-case-answer.ts). */
	example: AnswerExample = useCaseAnswerChat
	/** The label before the calls. */
	callsLabel = useCaseAnswerCallsLabel

	render() {
		const e = this.example ?? useCaseAnswerChat
		const api = e.mode === 'api'
		const [itemLabel, figureLabel] = e.columns
		const hasFigure = e.rows.some((r) => r.figure)
		const last = e.rows.length - 1
		return html`<div data-ds="use-case-answer" data-mode=${e.mode} class="flex flex-col gap-6 rounded-panel bg-surface-raised p-4 text-fg md:gap-8 md:p-8">${api && e.request ? html`<pre tabindex="0" class="fade-x m-0 overflow-x-auto rounded-ds-sm bg-surface p-4 font-code type-ui text-fg-soft md:p-6"><code>${e.request}</code></pre>` : html`<p class="max-w-[88%] self-end rounded-ds-lg bg-surface-inset px-4 py-3 type-body text-pretty">${e.mention ? html`<span class="font-medium">${e.mention}</span> ` : nothing}${e.question}</p>`}<div class="flex flex-col gap-4"><p class="type-ui text-fg-muted">${e.status}</p>${e.lead ? html`<p class="type-body font-medium text-pretty">${e.lead}</p>` : nothing}<table class="w-full border-collapse type-body"><thead><tr><th scope="col" colspan="2" class=${['border-b border-edge-surface pb-2 text-left type-ui font-regular text-fg-muted', api ? 'font-code' : ''].join(' ').trim()}>${itemLabel}</th>${hasFigure ? html`<th scope="col" class=${['border-b border-edge-surface pb-2 pl-4 text-right type-ui font-regular whitespace-nowrap text-fg-muted', api ? 'font-code' : ''].join(' ').trim()}>${figureLabel}</th>` : nothing}</tr></thead><tbody>${e.rows.map((row, i) => {
			const cell = i === last ? 'pt-3 align-top' : 'border-b border-edge-surface py-3 align-top'
			return html`<tr><td class=${`${cell} w-16 pr-4`}>${row.creative ? html`<spyglass-creative-card .src=${row.creative.src} .alt=${row.creative.alt ?? ''} .fit=${row.creative.fit} .position=${row.creative.position} .brand=${row.creative.brand} .tone=${row.creative.tone ?? 2} ratio="4/5" class="w-12"></spyglass-creative-card>` : nothing}</td><td class=${cell}><span class="block font-medium">${row.title}</span><span class="mt-1 block type-ui text-pretty text-fg-soft">${row.detail}</span></td>${hasFigure ? html`<td class=${`${cell} pl-4 text-right type-body-lg whitespace-nowrap tabular-nums`}>${row.figure}</td>` : nothing}</tr>`
		})}</tbody></table>${e.note ? html`<p class="border-t border-edge-surface pt-4 type-ui text-pretty text-fg-soft">${e.note}</p>` : nothing}<p class="flex flex-wrap items-center gap-2 type-ui"><span class="text-fg-muted">${this.callsLabel ?? useCaseAnswerCallsLabel}</span>${e.calls.map((call) => html`<code class="rounded-ds-sm bg-surface-inset px-2 py-1 font-code text-fg">${call}</code>`)}</p></div></div>`
	}
}

define('use-case-answer', UseCaseAnswer)
