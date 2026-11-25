'use client'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { Plug } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { asciiDriftStyleObject } from '@/lib/ascii-drift'
import { ASCII_TEXTURE } from '@/lib/textures'
import { runBuild, runChat, typedText, turnPictures, tileSlot, useCaseBuildContent, useCaseChatContent, useCaseHeroContent, type BuildContent, type ChatContent, type ChatPicture, type ChatTurn, type UseCaseHeroContent } from '@/lib/use-case-hero'
import { cn } from '@/react/lib/cn'
import { imageFit } from '@/lib/image'

// The site's use case hero (pages/UseCasesPage/UseCaseHero): the page's name as the head, the line in the soft gray,
// the actions (a White button and a quiet one, or a `control` such as the connect menu in the White button's place,
// which on phones steps aside and turns the quiet button White) and who it is for; beside it from 1024, on the raised
// panel with the ASCII texture around its edge, the visual: `chat`, a session where questions type, send and get
// answered in turn (chips pick one; a pointer or focus holds the answer), or `build`, a team's own ad library whose
// sort changes every few seconds and whose tiles glide into place. Three ASCII drifts at the left from 1024. The
// motion runs in lib/use-case-hero.ts; with reduced motion the chat shows an answer and the library holds still.
export interface UseCaseHeroProps {
  content?: UseCaseHeroContent
  /** chat (the default) or build. */
  visual?: 'chat' | 'build'
  /** The chat's session. */
  chat?: ChatContent
  /** The build visual's library. */
  build?: BuildContent
  /** A control in the White button's place (a connect menu). */
  control?: ReactNode
  /** On phones, hide the control and turn the quiet button White (the site's MCP pair). */
  pair?: boolean
  className?: string
}

export function UseCaseHero({ content: c = useCaseHeroContent, visual = 'chat', chat = useCaseChatContent, build = useCaseBuildContent, control, pair = true, className }: UseCaseHeroProps) {
  const paired = Boolean(control) && pair
  return (
    <section data-ds="use-case-hero" aria-labelledby={`${c.id}-heading`} className={cn('ds-uch relative isolate grid items-center text-fg', className)}>
      <style href="ds-use-case-hero" precedence="ds">{css}</style>
      <span aria-hidden="true" className="ds-uch-drift" data-at="top" style={asciiDriftStyleObject('scatter', 'top', 'hero')} />
      <span aria-hidden="true" className="ds-uch-drift" data-at="side" style={asciiDriftStyleObject('column', 'left', 'hero')} />
      <span aria-hidden="true" className="ds-uch-drift" data-at="foot" style={asciiDriftStyleObject('mass', 'centre', 'hero')} />
      <div className="ds-uch-wrap grid grid-cols-[minmax(0,1fr)] gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12">
        <div className="flex min-w-0 flex-col items-start">
          <h1 id={`${c.id}-heading`} className="type-section text-balance">{c.name}</h1>
          <p className="mt-6 max-w-measure type-body-lg text-pretty text-fg-soft">{c.line}</p>
          <div className="mt-10 flex flex-col gap-3 self-stretch md:flex-row md:flex-wrap md:self-auto">
            {control ? <div className={paired ? 'contents max-md:hidden' : 'contents'}>{control}</div> : <Button href={c.primary.href}>{c.primary.label}</Button>}
            {paired ? (
              <>
                <div className="contents max-md:hidden"><Button href={c.secondary.href} variant="secondary">{c.secondary.label}</Button></div>
                <div className="contents md:hidden"><Button href={c.secondary.href}>{c.secondary.label}</Button></div>
              </>
            ) : <Button href={c.secondary.href} variant="secondary">{c.secondary.label}</Button>}
          </div>
          <p className="mt-6 type-ui text-pretty text-fg-muted">{c.forWho}.</p>
        </div>
        <div className="ds-uch-box">
          <span aria-hidden="true" className="ds-uch-ascii" style={{ backgroundImage: `url("${ASCII_TEXTURE}")` }} />
          {visual === 'build' ? <BuildVisual content={build} /> : <ChatVisual content={chat} />}
          {c.source ? <p className="sr-only">{c.source}</p> : null}
        </div>
      </div>
    </section>
  )
}

export default UseCaseHero

function Picture({ picture, className, style, ...rest }: { picture: ChatPicture; className: string; style?: CSSProperties; [data: `data-${string}`]: string | number }) {
  return (
    <span className={cn(className, !picture.src && `ds-uch-tone-${picture.tone ?? 2}`)} data-ds-placeholder={picture.src ? undefined : ''} style={style} {...rest}>
      {picture.src ? <img className="ds-uch-pic" src={picture.src} alt="" loading="lazy" decoding="async" style={imageFit(picture)} /> : null}
    </span>
  )
}

function ChatVisual({ content }: { content: ChatContent }) {
  const ref = useRef<HTMLElement>(null)
  const { turns } = content
  useEffect(() => (ref.current ? runChat(ref.current, turns) : undefined), [turns])
  return (
    <figure ref={ref} data-uch-chat="" className="ds-uch-chat" aria-label={content.label}>
      <div className="ds-uch-scene">
        <div className="ds-uch-window" data-window="">
          <p className="ds-uch-server">
            <Plug className="ds-uch-mark" size={16} strokeWidth={1.5} aria-hidden="true" />
            <span className="ds-uch-server-name">{content.server}</span>
            <span className="ds-uch-status type-label">{content.status}</span>
          </p>
          <div className="ds-uch-thread" data-thread="">
            {turns.map((t, i) => <Turn key={t.question} turn={t} index={i} />)}
          </div>
          <div className="ds-uch-composer">
            <p className="ds-uch-input" aria-hidden="true">
              {turns.map((t) => <span key={t.question} className="ds-uch-ghost">{typedText(t)}</span>)}
              <span data-placeholder="" className="ds-uch-placeholder">{content.composer}</span>
              <span data-typed="" className="ds-uch-typed">
                {turns.map((t, i) => (
                  <span key={t.question} data-q={i} hidden={i !== 0}>
                    {[...typedText(t)].map((ch, k) => <span key={k} data-char="" className={t.mention && k < t.mention.length ? 'ds-uch-mention' : undefined} style={{ display: 'none' }}>{ch}</span>)}
                  </span>
                ))}
                <span data-caret="" className="ds-uch-caret" style={{ opacity: 0 }} />
              </span>
            </p>
            <div className="ds-uch-chips" role="group" aria-label={content.chipsLabel} data-chips="">
              <span className="ds-uch-pill" data-pill="" aria-hidden="true" />
              {turns.map((t, i) => <button key={t.chip} type="button" className="ds-uch-chip" data-chip={i} aria-pressed={i === 0}>{t.chip}</button>)}
            </div>
            <span className="ds-uch-send" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12.5v-9M4 7.5l4-4 4 4" /></svg>
            </span>
          </div>
        </div>
      </div>
      <p data-live="" className="sr-only" aria-live="polite" />
    </figure>
  )
}

function Turn({ turn, index }: { turn: ChatTurn; index: number }) {
  const pictures = turnPictures(turn)
  return (
    <div className="ds-uch-turn" data-turn={index} style={index === 0 ? undefined : { visibility: 'hidden' }}>
      <p className="ds-uch-message" data-message="">
        {turn.mention ? <span className="ds-uch-mention">{turn.mention} </span> : null}
        {turn.question}
      </p>
      <div className="ds-uch-agent">
        <p className="ds-uch-worked" data-call="">{turn.status}</p>
        <p className="ds-uch-call" data-call="">
          <Plug className="ds-uch-mark" size={16} strokeWidth={1.5} aria-hidden="true" />
          <span className="ds-uch-call-name">{turn.tool}</span>
          <span className="ds-uch-call-args">{turn.args}</span>
        </p>
        {turn.post ? (
          <div className="ds-uch-lead" data-line="">
            <p className="ds-uch-reply">{turn.lead}</p>
            <p className="ds-uch-row">
              <Picture picture={turn.post.picture} className="ds-uch-thumb" />
              <span className="ds-uch-row-text ds-uch-post-text">{turn.post.title}<span className="ds-uch-detail">{turn.post.detail}</span></span>
            </p>
          </div>
        ) : <p className="ds-uch-reply" data-line="">{turn.lead}</p>}
        <table className="ds-uch-table">
          <thead>
            <tr data-line="">{turn.columns.map((col) => <th key={col} scope="col">{col}</th>)}</tr>
          </thead>
          <tbody>
            {turn.rows.map((r) => (
              <tr key={r.label} data-line="">
                <th scope="row">
                  <span className="ds-uch-row">
                    {r.picture ? <Picture picture={r.picture} className="ds-uch-thumb" /> : null}
                    <span className="ds-uch-row-text">{r.label}<span className="ds-uch-detail">{r.detail}</span></span>
                  </span>
                </th>
                <td>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pictures.length ? (
          <div className="ds-uch-strip" data-strip="" aria-hidden="true">
            {pictures.map((p, k) => <Picture key={k} picture={p} className="ds-uch-strip-pic" data-pic={k} style={{ aspectRatio: String(p.ratio ?? 0.8) }} />)}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const swapHtml = (text: string) => ({ __html: `<span class="ds-uch-swap-item" data-state="in">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>` })

function BuildVisual({ content: b }: { content: BuildContent }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => (ref.current ? runBuild(ref.current, b) : undefined), [b])
  const sort = b.sorts[0]
  return (
    <div ref={ref} data-uch-build="" className="ds-uch-build">
      <p className="sr-only">{b.description}</p>
      <div className="ds-uch-bwin" aria-hidden="true">
        <div className="ds-uch-bar">
          <span className="ds-uch-dots">
            <span className="ds-uch-dot bg-(--ds-color-window-close)" />
            <span className="ds-uch-dot bg-(--ds-color-window-min)" />
            <span className="ds-uch-dot bg-(--ds-color-window-full)" />
          </span>
          <span className="ds-uch-url">{b.url}</span>
          <span className="ds-uch-built-on">{b.builtOn}</span>
        </div>
        <div className="ds-uch-body">
          <div className="ds-uch-head">
            <span className="ds-uch-titles">
              <span className="ds-uch-title">{b.title}</span>
              <span className="ds-uch-meta">{b.meta}</span>
            </span>
            <span className="ds-uch-sort"><span className="ds-uch-swap" data-swap="sort" dangerouslySetInnerHTML={swapHtml(sort.label)} /></span>
          </div>
          <div className="ds-uch-grid">
            {b.tiles.map((t) => <span key={t.id} className="ds-uch-cell" />)}
            {b.tiles.map((t) => {
              const { col, row } = tileSlot(sort, t.id)
              return (
                <span key={t.id} className={cn('ds-uch-tile', !t.src && `ds-uch-tone-${t.tone ?? 2}`)} data-ds-placeholder={t.src ? undefined : ''} data-tile={t.id} style={{ '--col': col, '--row': row } as CSSProperties}>
                  {t.src ? <img className="ds-uch-pic" src={t.src} alt="" decoding="async" style={imageFit(t)} /> : null}
                  <span className="ds-uch-badge"><span className="ds-uch-swap" data-swap={`figure:${t.id}`} dangerouslySetInnerHTML={swapHtml(t.figure[sort.key] ?? '')} /></span>
                </span>
              )
            })}
          </div>
          <div className="ds-uch-code">
            <span className="ds-uch-line"><span className="ds-uch-c-fg">{b.call.method}</span> <span className="ds-uch-c-muted">{b.call.path}</span></span>
            {b.call.lines.map((line) => (
              <span key={line.key} className="ds-uch-line">
                <span className="ds-uch-c-soft">&quot;{line.key}&quot;</span>
                <span className="ds-uch-c-muted">: </span>
                {line.value === null ? <span className="ds-uch-swap ds-uch-c-fg" data-swap="sortBy" dangerouslySetInnerHTML={swapHtml(sort.sortBy)} /> : <span className="ds-uch-c-fg">{line.value}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const css = `
.ds-uch { min-height: calc(100svh - var(--ds-space-4xl)); padding-block: var(--ds-space-4xl) var(--ds-space-5xl); }
.ds-uch-wrap { width: 100%; max-width: calc(var(--ds-layout-content) + 2 * var(--ds-layout-gutter)); margin-inline: auto; padding-inline: var(--ds-layout-gutter); }
.ds-uch-drift { display: none; position: absolute; z-index: -1; pointer-events: none; user-select: none; }
.ds-uch-box { position: relative; isolation: isolate; display: grid; min-width: 0; padding: var(--ds-space-lg); overflow: clip; border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-raised); }
.ds-uch-ascii { position: absolute; inset: 0; z-index: -1; pointer-events: none; background-position: 24% 64%; background-size: var(--ds-ascii-tile) var(--ds-ascii-tile); background-repeat: repeat; opacity: var(--ds-uc-ascii-opacity); mix-blend-mode: screen; mask-image: radial-gradient(ellipse var(--ds-uc-ascii-clear-w) var(--ds-uc-ascii-clear-h) at 50% 50%, transparent 40%, var(--ds-color-black) 100%); -webkit-mask-image: radial-gradient(ellipse var(--ds-uc-ascii-clear-w) var(--ds-uc-ascii-clear-h) at 50% 50%, transparent 40%, var(--ds-color-black) 100%); }
.ds-uch-tone-1 { background-image: linear-gradient(to bottom, var(--ds-color-neutral-4), var(--ds-color-neutral-2)); }
.ds-uch-tone-2 { background-image: linear-gradient(to bottom, var(--ds-color-neutral-5), var(--ds-color-neutral-3)); }
.ds-uch-tone-3 { background-image: linear-gradient(to bottom, var(--ds-color-neutral-6), var(--ds-color-neutral-4)); }
.ds-uch-tone-4 { background-image: linear-gradient(to bottom, var(--ds-color-neutral-7), var(--ds-color-neutral-5)); }
.ds-uch-pic { display: block; width: 100%; height: 100%; object-fit: cover; }

/* The chat (site UseCaseChat and V2HowItWorks/Session). */
.ds-uch-chat { position: relative; display: grid; min-width: 0; container: uch-chat / inline-size; }
.ds-uch-scene { position: relative; min-width: 0; }
.ds-uch-window { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: var(--ds-space-md); min-width: 0; padding: var(--ds-space-md) 20px var(--ds-space-lg); border: var(--ds-border-hairline) solid var(--ds-color-edge-surface); border-radius: var(--ds-radius-panel); background: var(--ds-color-black); color: var(--ds-color-fg); }
.ds-uch-server { position: relative; z-index: 1; display: flex; align-items: center; gap: var(--ds-space-sm); padding-bottom: var(--ds-space-md); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-uch-mark { flex: none; width: var(--ds-size-icon-sm); height: var(--ds-size-icon-sm); color: var(--ds-color-fg-soft); }
.ds-uch-server-name { font-weight: var(--ds-font-weight-medium); }
.ds-uch-status { margin-left: auto; color: var(--ds-color-fg-muted); }
.ds-uch-thread { position: relative; display: grid; align-items: start; margin-top: calc(-1 * var(--ds-space-xl)); margin-bottom: calc(-1 * var(--ds-space-xl)); padding-top: var(--ds-space-xl); padding-bottom: var(--ds-space-xl); mask-image: linear-gradient(to bottom, transparent, var(--ds-color-black) var(--ds-uc-chat-thread-fade)); -webkit-mask-image: linear-gradient(to bottom, transparent, var(--ds-color-black) var(--ds-uc-chat-thread-fade)); }
.ds-uch-turn { grid-area: 1 / 1; display: grid; gap: var(--ds-space-md); min-width: 0; }
.ds-uch-message { justify-self: end; max-width: 80%; padding: var(--ds-space-sm) var(--ds-space-md); border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-raised); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); transform-origin: right center; will-change: transform, opacity; }
.ds-uch-mention { font-weight: var(--ds-font-weight-medium); }
.ds-uch-agent { display: grid; gap: var(--ds-space-sm); min-width: 0; }
.ds-uch-worked { font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); color: var(--ds-color-fg-muted); transform-origin: left center; will-change: transform, opacity; }
.ds-uch-call { display: flex; align-items: center; gap: var(--ds-space-sm); min-width: 0; overflow: hidden; font-family: var(--ds-font-code); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; transform-origin: left center; will-change: transform, opacity; }
.ds-uch-call-name { color: var(--ds-color-fg); }
.ds-uch-call-args { overflow: hidden; text-overflow: ellipsis; color: var(--ds-color-fg-muted); }
.ds-uch-reply { color: var(--ds-color-fg-soft); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); transform-origin: left center; will-change: transform, opacity; }
.ds-uch-lead { display: grid; gap: var(--ds-space-sm); transform-origin: left center; will-change: transform, opacity; }
.ds-uch-row { display: flex; align-items: flex-start; gap: var(--ds-space-md); min-width: 0; }
.ds-uch-row-text { min-width: 0; overflow-wrap: anywhere; }
.ds-uch-post-text { font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-uch-detail { display: block; margin-top: var(--ds-space-xs); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); color: var(--ds-color-fg-muted); text-wrap: pretty; }
.ds-uch-thumb { flex: none; width: var(--ds-uc-chat-thumb); height: var(--ds-uc-chat-thumb); overflow: hidden; border-radius: var(--ds-radius-sm); background-color: var(--ds-color-surface-subtle); }
.ds-uch-table { width: 100%; margin-top: var(--ds-space-xs); table-layout: auto; border-collapse: separate; border-spacing: 0; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-uch-table tr { transform-origin: left center; will-change: transform, opacity; }
.ds-uch-table th, .ds-uch-table td { height: var(--ds-size-control-sm); padding: 0; overflow: hidden; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); text-align: right; text-overflow: ellipsis; white-space: nowrap; font-weight: var(--ds-font-weight-regular); }
.ds-uch-table th:first-child { text-align: left; }
.ds-uch-table thead th:first-child { padding-right: var(--ds-space-lg); }
.ds-uch-table thead th { height: var(--ds-space-xl); color: var(--ds-color-fg-muted); font-size: var(--ds-text-label); line-height: var(--ds-text-label-leading); font-weight: var(--ds-font-weight-medium); letter-spacing: var(--ds-tracking-label); text-transform: uppercase; }
.ds-uch-table tbody th, .ds-uch-table tbody td { height: auto; padding-block: var(--ds-space-sm); vertical-align: top; white-space: normal; }
.ds-uch-table tbody th { color: var(--ds-color-fg); }
.ds-uch-table td { color: var(--ds-color-fg-soft); font-variant-numeric: tabular-nums; }
.ds-uch-table td, .ds-uch-table thead th + th { width: 1%; padding-left: var(--ds-space-md); white-space: nowrap; }
.ds-uch-strip { display: flex; gap: var(--ds-space-sm); margin-top: var(--ds-space-xs); overflow: hidden; }
.ds-uch-strip-pic { flex: none; height: var(--ds-uc-chat-strip-h); overflow: hidden; border-radius: var(--ds-radius-sm); background-color: var(--ds-color-surface-subtle); opacity: 0; will-change: transform, opacity; }
.ds-uch-composer { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "input input" "chips send"; align-items: center; gap: var(--ds-space-sm) var(--ds-space-md); padding: var(--ds-space-md) var(--ds-space-md) var(--ds-space-md) var(--ds-space-lg); border: var(--ds-border-hairline) solid var(--ds-color-edge-surface); border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-subtle); }
.ds-uch-input { grid-area: input; display: grid; min-width: 0; min-height: calc(var(--ds-text-ui) * var(--ds-text-ui-leading)); align-items: center; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-uch-ghost, .ds-uch-placeholder, .ds-uch-typed { grid-area: 1 / 1; }
.ds-uch-ghost { visibility: hidden; }
.ds-uch-placeholder { color: var(--ds-color-fg-muted); }
.ds-uch-caret { display: inline-block; width: var(--ds-border-focus); height: var(--ds-text-ui); vertical-align: -2px; background: var(--ds-color-fg); }
.ds-uch-send { grid-area: send; display: grid; flex: none; place-items: center; width: var(--ds-size-control-sm); height: var(--ds-size-control-sm); border-radius: var(--ds-radius-panel); background: var(--ds-color-white); color: var(--ds-color-black); }
.ds-uch-chips { grid-area: chips; position: relative; isolation: isolate; display: flex; flex-wrap: wrap; gap: var(--ds-space-sm); }
.ds-uch-pill { position: absolute; top: 0; left: 0; z-index: -1; border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-subtle); opacity: 0; pointer-events: none; transition: transform var(--ds-duration-micro) var(--ds-easing-loop), width var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-uch-chip { position: relative; height: 28px; padding-inline: var(--ds-space-md); border: var(--ds-border-hairline) solid var(--ds-color-edge-surface); border-radius: var(--ds-radius-panel); background: transparent; color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-uch-chip[aria-pressed="true"] { color: var(--ds-color-fg); }
@media (hover: hover) and (pointer: fine) { .ds-uch-chip[aria-pressed="false"]:hover { color: var(--ds-color-fg-soft); } }
@media (pointer: coarse) { .ds-uch-chips { gap: var(--ds-space-lg) var(--ds-space-sm); } .ds-uch-chip::after { content: ""; position: absolute; inset: calc(var(--ds-space-sm) * -1) calc(var(--ds-space-xs) * -1); } }
.ds-uch-chat :is([data-message], [data-call], [data-line]) { opacity: 0; }
.ds-uch-chat [data-turn="0"] :is([data-message], [data-call], [data-line], [data-pic]) { opacity: 1; }
@container uch-chat (width < 560px) { .ds-uch-window { padding-inline: var(--ds-space-lg); } }

/* The build visual (site BuildHero). */
.ds-uch-build { display: grid; justify-items: center; min-width: 0; container: uch-build / inline-size; }
.ds-uch-bwin { display: grid; width: 100%; min-width: 0; overflow: clip; border: var(--ds-border-hairline) solid var(--ds-color-edge-surface); border-radius: var(--ds-radius-panel); background: var(--ds-color-black); }
.ds-uch-bar { display: flex; align-items: center; gap: var(--ds-space-md); min-width: 0; height: var(--ds-size-control-sm); padding-inline: var(--ds-space-md); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge-surface); }
.ds-uch-dots { display: flex; flex: none; gap: var(--ds-space-xs); }
.ds-uch-dot { width: var(--ds-space-sm); height: var(--ds-space-sm); border-radius: var(--ds-radius-full); }
.ds-uch-url { min-width: 0; overflow: hidden; padding: 0 var(--ds-space-sm); border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-subtle); font-family: var(--ds-font-code); font-size: var(--ds-text-caption); line-height: 20px; white-space: nowrap; text-overflow: ellipsis; color: var(--ds-color-fg-muted); }
.ds-uch-built-on { flex: none; margin-left: auto; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); color: var(--ds-color-fg-muted); }
.ds-uch-body { display: grid; gap: var(--ds-space-lg); min-width: 0; padding: var(--ds-space-lg) 20px 20px; }
.ds-uch-head { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-md); min-width: 0; }
.ds-uch-titles { display: grid; min-width: 0; }
.ds-uch-title { font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); font-weight: var(--ds-font-weight-medium); color: var(--ds-color-fg); }
.ds-uch-meta { overflow: hidden; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; text-overflow: ellipsis; color: var(--ds-color-fg-muted); }
.ds-uch-sort { flex: none; display: inline-grid; justify-items: end; padding: var(--ds-space-xs) var(--ds-space-md); border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-subtle); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); color: var(--ds-color-fg); }
.ds-uch-grid { --gap: var(--ds-space-sm); position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--gap); }
.ds-uch-cell { aspect-ratio: 1; }
.ds-uch-tile { position: absolute; top: 0; left: 0; width: calc((100% - 2 * var(--gap)) / 3); aspect-ratio: 1; overflow: hidden; border-radius: var(--ds-radius-sm); background-color: var(--ds-color-surface-subtle); transform: translate(calc(var(--col) * (100% + var(--gap))), calc(var(--row) * (100% + var(--gap)))); transition: transform var(--ds-uc-loop-change) var(--ds-easing-loop); }
.ds-uch-badge { position: absolute; left: var(--ds-space-sm); bottom: var(--ds-space-sm); padding: var(--ds-space-xs) var(--ds-space-sm); border-radius: var(--ds-radius-sm); background: var(--ds-color-black); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); font-variant-numeric: tabular-nums; color: var(--ds-color-fg); }
.ds-uch-code { display: grid; min-width: 0; padding: var(--ds-space-md) var(--ds-space-lg); border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-raised); font-family: var(--ds-font-code); font-size: var(--ds-text-caption); line-height: 20px; white-space: nowrap; }
.ds-uch-line { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ds-uch-line + .ds-uch-line { padding-left: var(--ds-space-lg); }
.ds-uch-c-fg { color: var(--ds-color-fg); }
.ds-uch-c-muted { color: var(--ds-color-fg-muted); }
.ds-uch-c-soft { color: var(--ds-color-fg-soft); }
.ds-uch-swap { display: inline-grid; vertical-align: top; overflow: clip; overflow-clip-margin: var(--ds-space-xs); }
.ds-uch-swap-item { grid-area: 1 / 1; white-space: nowrap; transition: opacity var(--ds-uc-loop-badge) var(--ds-easing-loop), transform var(--ds-uc-loop-badge) var(--ds-easing-loop); }
.ds-uch-swap-item[data-state="enter"] { opacity: 0; transform: translateY(var(--ds-space-md)); transition: none; }
.ds-uch-swap-item[data-state="out"] { opacity: 0; transform: translateY(calc(var(--ds-space-md) * -1)); }
@container uch-build (width < 400px) { .ds-uch-built-on { display: none; } .ds-uch-body { padding: var(--ds-space-md) var(--ds-space-lg) var(--ds-space-lg); } }

@media (min-width: 768px) { .ds-uch { padding-block: var(--ds-space-6xl); } }
@media (min-width: 1024px) {
  .ds-uch { min-height: calc(100svh - var(--ds-size-header)); padding-block: var(--ds-space-md); }
  .ds-uch-box { justify-self: end; width: calc(var(--ds-uc-chat-w) + 2 * var(--ds-space-3xl)); max-width: 100%; padding: var(--ds-space-3xl); }
  .ds-uch-drift { display: block; }
  .ds-uch-drift[data-at="top"] { top: 0; left: 0; width: 50%; height: 28%; }
  .ds-uch-drift[data-at="side"] { top: 24%; left: 0; width: max(var(--ds-space-5xl), (100% - var(--ds-layout-content)) / 2 - var(--ds-space-2xl)); height: 52%; }
  .ds-uch-drift[data-at="foot"] { bottom: var(--ds-space-2xl); left: 0; width: 46%; height: 24%; }
  .ds-uch-chat { justify-items: center; }
  .ds-uch-scene, .ds-uch-bwin { width: var(--ds-uc-chat-w); }
  .ds-uch-strip { display: none; }
  .ds-uch-chat [data-message] { max-width: 88%; }
}
@media (min-width: 1280px) {
  .ds-uch-box { width: calc(var(--ds-uc-chat-w-l) + 2 * var(--ds-space-3xl)); }
  .ds-uch-scene, .ds-uch-bwin { width: var(--ds-uc-chat-w-l); }
}
@media (prefers-reduced-motion: reduce) { .ds-uch-pill, .ds-uch-tile, .ds-uch-swap-item { transition: none; } }
`
