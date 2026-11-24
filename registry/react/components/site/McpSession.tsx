'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { ASCII_TEXTURE } from '@/lib/textures'
import { sessionContent, startSession, typedText, type SessionContent, type SessionQuestion } from '@/lib/home/session'
import { cn } from '@/react/lib/cn'

// The site's MCP session (v2/V2HowItWorks Session): a #262626 stage with the ASCII texture at its edges and a Black
// chat window rising from its foot, fading out at the bottom. An AI chat asks the server a question at a typist's
// rhythm; the message, the tool call and the reply settle in from 90%, the four creatives arrive one by one, the
// table's rows rise into place and hold, then everything settles out and the next question is typed. It plays while a
// quarter of it is on screen; reduced motion rests on the first answer. Acme questions by default (`content`); the
// creatives are placeholders unless their `src` is given.
export interface McpSessionProps {
  content?: SessionContent
  className?: string
}

function Turn({ q, first }: { q: SessionQuestion; first: boolean }) {
  return (
    <div className="ds-ss-turn" data-turn="" style={first ? undefined : { visibility: 'hidden' }}>
      <p className="ds-ss-message" data-message="">{q.mention ? <span className="ds-ss-mention">{q.mention} </span> : null}{q.text}</p>
      <div className="ds-ss-agent">
        <p className="ds-ss-call" data-call=""><span className="ds-ss-glyph" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 4.5h10M3 8h10M3 11.5h6" /></svg></span><span className="ds-ss-call-name">{q.tool}</span><span className="ds-ss-call-args">{q.args}</span></p>
        <p className="ds-ss-reply" data-line="">{q.reply}</p>
        <div className="ds-ss-thumbs" data-thumbs="">
          {q.images.map((img) => <span key={img.alt} className="ds-ss-thumb" data-thumb=""><CreativeCard ratio="fill" src={img.src} alt={img.alt} tone={img.tone ?? 2} /></span>)}
        </div>
        <table className="ds-ss-table">
          <thead><tr data-line="">{q.columns.map((col) => <th key={col} scope="col">{col}</th>)}</tr></thead>
          <tbody>{q.rows.map((r) => <tr key={r.label} data-line=""><th scope="row">{r.label}</th><td>{r.value}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

export function McpSession({ content = sessionContent, className }: McpSessionProps) {
  const ref = useRef<HTMLElement>(null)
  const { questions } = content
  useEffect(() => (ref.current ? startSession(ref.current, questions) : undefined), [questions])
  return (
    <figure ref={ref} data-ds="mcp-session" className={cn('ds-ss', className)} aria-label={content.label}>
      <style href="ds-mcp-session" precedence="ds">{css}</style>
      <span className="ds-ss-ascii" aria-hidden="true" style={{ backgroundImage: `url("${ASCII_TEXTURE}")` }} />
      <div className="ds-ss-window" data-window="">
        <p className="ds-ss-server">
          <span className="ds-ss-glyph" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 4.5h10M3 8h10M3 11.5h6" /></svg></span>
          <span className="ds-ss-server-name">{content.server}</span>
          <span className="ds-ss-status">{content.status}</span>
        </p>
        <div className="ds-ss-thread">{questions.map((q, i) => <Turn key={i} q={q} first={i === 0} />)}</div>
        <div className="ds-ss-composer" aria-hidden="true">
          <p className="ds-ss-input">
            {questions.map((q, i) => <span key={i} className="ds-ss-ghost">{typedText(q)}</span>)}
            <span data-placeholder="" className="ds-ss-placeholder">{content.composer}</span>
            <span data-typed="" data-q="0" className="ds-ss-typed">
              {questions.map((q, i) => (
                <span key={i} data-q={i} hidden={i !== 0}>
                  {[...typedText(q)].map((ch, k) => <span key={k} data-char="" className={q.mention && k < q.mention.length ? 'ds-ss-mention' : undefined} style={{ display: 'none' } as CSSProperties}>{ch}</span>)}
                </span>
              ))}
              <span data-caret="" className="ds-ss-caret" style={{ opacity: 0 }} />
            </span>
          </p>
          <span className="ds-ss-send"><svg viewBox="0 0 16 16"><path d="M8 12.5v-9M4 7.5l4-4 4 4" /></svg></span>
        </div>
      </div>
    </figure>
  )
}

export default McpSession

const css = `
.ds-ss { position: relative; isolation: isolate; display: grid; min-width: 0; min-height: var(--ds-session-min-h); margin: 0; padding: 40px 40px 0; overflow: clip; container: session / inline-size; border-radius: var(--ds-radius-control); background: var(--ds-color-surface-raised); }
.ds-ss::after { content: ""; position: absolute; right: 0; bottom: 0; left: 0; z-index: 10; height: 96px; background: linear-gradient(to bottom, transparent, var(--ds-color-surface-raised)); pointer-events: none; }
.ds-ss-ascii { position: absolute; inset: 0; z-index: -1; pointer-events: none; background-position: 24% 64%; background-size: var(--ds-ascii-tile) var(--ds-ascii-tile); opacity: var(--ds-ascii-quiet); mix-blend-mode: screen; mask-image: radial-gradient(ellipse 46% 50% at 50% 50%, transparent 40%, var(--ds-color-black) 100%); }
.ds-ss-window { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 16px; min-width: 0; padding: 16px 24px 24px; border: var(--ds-border-hairline) solid var(--ds-color-edge-surface); border-bottom: 0; border-radius: var(--ds-radius-control) var(--ds-radius-control) 0 0; background: var(--ds-color-black); color: var(--ds-color-fg); }
.ds-ss-server { display: flex; align-items: center; gap: 8px; padding-bottom: 12px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-ss-glyph { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ds-color-fg-soft); }
.ds-ss-glyph svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.ds-ss-server-name { font-weight: var(--ds-font-weight-medium); }
.ds-ss-status { margin-left: auto; color: var(--ds-color-fg-muted); font-size: var(--ds-text-label); line-height: var(--ds-text-label-leading); font-weight: var(--ds-font-weight-medium); letter-spacing: var(--ds-tracking-label); text-transform: uppercase; }
.ds-ss-thread { display: grid; align-items: end; }
.ds-ss-turn { grid-area: 1 / 1; display: grid; gap: 16px; min-width: 0; }
.ds-ss-message { justify-self: end; max-width: 80%; margin: 0; padding: 8px 12px; border-radius: var(--ds-radius-control); background: var(--ds-color-surface-raised); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); transform-origin: right center; will-change: transform, opacity; }
.ds-ss-mention { font-weight: var(--ds-font-weight-medium); }
.ds-ss-agent { display: grid; gap: 12px; min-width: 0; }
.ds-ss-call { display: flex; align-items: center; gap: 8px; min-width: 0; margin: 0; overflow: hidden; font-family: var(--ds-font-code); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; transform-origin: left center; will-change: transform, opacity; }
.ds-ss-call-name { color: var(--ds-color-fg); }
.ds-ss-call-args { overflow: hidden; text-overflow: ellipsis; color: var(--ds-color-fg-muted); }
.ds-ss-reply { margin: 0; color: var(--ds-color-fg-soft); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); transform-origin: left center; will-change: transform, opacity; }
.ds-ss-thumbs { display: grid; grid-template-columns: repeat(4, minmax(0, var(--session-thumb, 1fr))); gap: 8px; transform-origin: left center; will-change: transform; }
.ds-ss-thumb { position: relative; overflow: hidden; aspect-ratio: 4 / 5; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-subtle); will-change: transform, opacity; }
.ds-ss-table { width: 100%; margin-top: 4px; table-layout: fixed; border-collapse: separate; border-spacing: 0; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-ss-table tr { transform-origin: left center; will-change: transform, opacity; }
.ds-ss-table th, .ds-ss-table td { height: 32px; padding: 0; overflow: hidden; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); text-align: right; text-overflow: ellipsis; white-space: nowrap; font-weight: var(--ds-font-weight-regular); }
.ds-ss-table th:first-child { padding-right: 16px; text-align: left; }
.ds-ss-table thead th { height: 24px; color: var(--ds-color-fg-muted); font-size: var(--ds-text-label); line-height: var(--ds-text-label-leading); font-weight: var(--ds-font-weight-medium); letter-spacing: var(--ds-tracking-label); text-transform: uppercase; }
.ds-ss-table td, .ds-ss-table thead th + th { width: 80px; }
.ds-ss-table tbody th { color: var(--ds-color-fg); }
.ds-ss-table td { color: var(--ds-color-fg-soft); font-variant-numeric: tabular-nums; }
.ds-ss-composer { display: flex; align-items: flex-end; gap: 12px; padding: 12px 12px 12px 16px; border: var(--ds-border-hairline) solid var(--ds-color-edge-surface); border-radius: var(--ds-radius-control); background: var(--ds-color-surface-subtle); }
.ds-ss-input { display: grid; flex: 1; min-width: 0; min-height: 32px; margin: 0; align-items: center; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-ss-ghost, .ds-ss-placeholder, .ds-ss-typed { grid-area: 1 / 1; }
.ds-ss-ghost { visibility: hidden; }
.ds-ss-placeholder { color: var(--ds-color-fg-muted); }
.ds-ss-caret { display: inline-block; width: var(--ds-border-focus); height: var(--ds-text-ui); vertical-align: -2px; background: var(--ds-color-fg); }
.ds-ss-send { display: grid; flex: none; place-items: center; width: 32px; height: 32px; border-radius: var(--ds-radius-control); background: var(--ds-color-white); color: var(--ds-color-black); }
.ds-ss-send svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
@container session (width < 560px) {
  .ds-ss-window { padding-inline: 16px; }
  .ds-ss-thumbs { gap: 4px; }
}
@media (width < 768px) { .ds-ss { padding: 24px 16px 0; } }
`
