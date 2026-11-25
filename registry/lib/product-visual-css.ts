// The product visuals' stylesheet, shared by both flavors: React renders it in a hoisted <style>, the web component
// adopts it in its shadow root. Ported from the site's CSS modules (pages/Products/visuals/*.module.css,
// ProductFeatures.module.css .stage and .ascii, v2/V2Features LinksBoard and PatternsSwitch), sizes kept, values
// through the brand tokens. The site's inset hairline rings are drawn as inset outlines, and its row rules as a 1px
// gradient line, so nothing shifts. The stage is a container ("ds-pv"): the site's 440 and 560 steps read its width.
export const productVisualCss = `
.ds-pv {
  position: relative; isolation: isolate; display: block; min-width: 0; aspect-ratio: 4 / 3; overflow: clip;
  container: ds-pv / inline-size; border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-raised);
  color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-caption);
  line-height: var(--ds-text-caption-leading); font-weight: var(--ds-font-weight-regular); text-align: left;
}
.ds-pv[data-fill] { aspect-ratio: auto; height: 100%; border-radius: var(--ds-radius-sm); background: transparent; }
.ds-pv *, .ds-pv *::before, .ds-pv *::after { box-sizing: border-box; }
.ds-pv-ascii {
  position: absolute; inset: 0; z-index: -1; pointer-events: none; background-image: var(--pv-ascii);
  background-size: var(--ds-ascii-tile) var(--ds-ascii-tile); background-position: var(--pv-ascii-at, 0 0);
  opacity: var(--ds-ascii-quiet); mix-blend-mode: screen;
  mask-image: radial-gradient(ellipse var(--ds-pv-ascii-clear-w) var(--ds-pv-ascii-clear-h) at 50% 50%, transparent 40%, var(--ds-color-black) 100%);
}
.ds-pv-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.ds-pv-root { position: absolute; inset: 0; }
.ds-pv-center { display: grid; place-items: center; }
.ds-pv-clip { overflow: clip; }
.ds-pv-fade::after {
  content: ""; position: absolute; right: 0; bottom: 0; left: 0; z-index: 10; height: 96px; pointer-events: none;
  background: linear-gradient(to bottom, transparent, var(--ds-color-surface-raised));
}
.ds-pv-strong { font-weight: var(--ds-font-weight-medium); }
.ds-pv-sub { color: var(--ds-color-fg-muted); }
.ds-pv-ellipsis { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* A picture: an image, or a neutral shape when there is none. */
.ds-pv-pic { position: absolute; inset: 0; overflow: hidden; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface); }
.ds-pv-img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.ds-pv-ph { position: absolute; inset: 0; background: linear-gradient(var(--pv-ph-a, 160deg), var(--ds-color-neutral-6), var(--ds-color-neutral-3) 70%); }

/* A round mark: an image, or the initial (on White, or on the inset fill for commenters). */
.ds-pv-mark {
  position: relative; display: grid; flex: none; place-items: center; overflow: hidden; width: 24px; height: 24px;
  border-radius: 50%; background: var(--ds-color-white); color: var(--ds-color-black); font-weight: var(--ds-font-weight-medium);
}
.ds-pv-mark[data-tone="inset"] { background: var(--ds-color-surface-inset); color: var(--ds-color-fg-soft); }
.ds-pv-mark[data-tone="row"] { background: var(--ds-color-surface-inset); color: var(--ds-color-fg); }
.ds-pv-mark > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

/* The sheet: a Black panel rising from the stage's floor, the floor fading it out. */
.ds-pv-sheet {
  position: absolute; top: 12.5%; left: 50%; display: flex; flex-direction: column; width: 70%;
  min-height: calc(87.5% + 16px); translate: -50%; padding: 16px 12px 0; border: var(--ds-border-hairline) solid var(--ds-color-edge-surface);
  border-radius: var(--ds-radius-panel) var(--ds-radius-panel) 0 0; background: var(--ds-color-black); color: var(--ds-color-fg);
}
.ds-pv-sheet[data-wide] { top: 16px; width: calc(100% - 32px); min-height: 100%; }
.ds-pv-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; height: 20px; margin-bottom: 16px; }
.ds-pv-control { margin-bottom: 16px; padding: 4px; border-radius: var(--ds-radius-panel); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline)); }
.ds-pv-steps { position: relative; display: flex; isolation: isolate; }
.ds-pv-step {
  display: grid; flex: 1 1 0; place-items: center; min-width: 0; height: 32px; padding: 0 4px; border: 0; border-radius: var(--ds-radius-panel);
  background: none; color: var(--ds-color-fg-muted); font: inherit; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading);
  font-weight: var(--ds-font-weight-medium); white-space: nowrap; transition: color var(--ds-duration-micro) var(--ds-easing-loop);
}
.ds-pv-step[data-on], .ds-pv-step[aria-selected="true"] { color: var(--ds-color-black); }
button.ds-pv-step { cursor: pointer; }
button.ds-pv-step:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: calc(-1 * var(--ds-border-focus)); }
.ds-pv-indicator {
  position: absolute; top: 0; left: 0; z-index: -1; width: calc(100% / var(--n)); height: 100%; border-radius: var(--ds-radius-panel);
  background: var(--ds-color-white); translate: calc(var(--i) * 100%); transition: translate var(--ds-duration-micro) var(--ds-easing-loop);
}
@media (hover: hover) and (pointer: fine) { button.ds-pv-step[aria-selected="false"]:hover { color: var(--ds-color-fg-soft); } }
@media (pointer: coarse) { button.ds-pv-step { position: relative; } button.ds-pv-step::after { content: ""; position: absolute; inset: -8px 0; } }
.ds-pv-swap { display: grid; }
.ds-pv-swap > * { grid-area: 1 / 1; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-pv-swap > [data-on] { opacity: 1; }

/* Records: a picture beside a panel, the sets crossing in turn (brand, creative, page, creator, tagged, thread). */
.ds-pv-record { --pic-w: 128px; --panel-w: 224px; --head-h: 48px; --row-h: 36px; --avatar: 24px; display: flex; align-items: center; gap: 16px; }
.ds-pv-record[data-variant="creator"] { --row-h: 32px; }
.ds-pv-record[data-variant="thread"] { --row-h: 48px; }
.ds-pv-record [data-set]:not([data-set="0"]) { opacity: 0; }
.ds-pv-picture { position: relative; flex: none; width: var(--pic-w); aspect-ratio: 4 / 5; }
.ds-pv-panel {
  display: flex; flex-direction: column; width: var(--panel-w); padding: 4px 12px; border-radius: var(--ds-radius-panel);
  outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline));
  background: var(--ds-color-black); color: var(--ds-color-fg);
}
.ds-pv-stack { display: grid; min-width: 0; }
.ds-pv-stack > * { grid-area: 1 / 1; }
.ds-pv-who { display: flex; align-items: center; gap: 8px; height: var(--head-h); min-width: 0; transform-origin: left center; }
.ds-pv-who[data-column] { flex-direction: column; align-items: stretch; justify-content: center; gap: 0; }
.ds-pv-names { display: flex; flex-direction: column; min-width: 0; }
.ds-pv-names[data-clip] { overflow: hidden; }
.ds-pv-names[data-clip] > * { overflow: hidden; text-overflow: ellipsis; }
.ds-pv-name { font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); font-weight: var(--ds-font-weight-medium); white-space: nowrap; }
.ds-pv-handle { color: var(--ds-color-fg-muted); white-space: nowrap; }
.ds-pv-rule { background: linear-gradient(var(--ds-color-edge-surface), var(--ds-color-edge-surface)) top / 100% var(--ds-border-hairline) no-repeat; }
.ds-pv-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: var(--row-h); }
.ds-pv-label { flex: none; color: var(--ds-color-fg-muted); }
.ds-pv-row > .ds-pv-stack { justify-items: end; }
.ds-pv-row[data-thread] > .ds-pv-stack { flex: 1; justify-items: stretch; }
.ds-pv-value { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; transform-origin: right center; }
.ds-pv-comment { display: flex; align-items: center; gap: 8px; min-width: 0; transform-origin: left center; }
.ds-pv-comment > .ds-pv-mark { width: var(--avatar); height: var(--avatar); }
.ds-pv-body { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.ds-pv-by { display: flex; justify-content: space-between; gap: 8px; color: var(--ds-color-fg-muted); white-space: nowrap; }
.ds-pv-by > :first-child { overflow: hidden; text-overflow: ellipsis; }
.ds-pv-by > :last-child { flex: none; font-variant-numeric: tabular-nums; }
@container ds-pv (width < 440px) {
  .ds-pv-record { --pic-w: 96px; --panel-w: 216px; --head-h: 40px; --row-h: 32px; gap: 12px; }
  .ds-pv-record[data-variant="creator"] { --row-h: 28px; }
  .ds-pv-record[data-variant="thread"] { --row-h: 44px; }
}
@container ds-pv (width >= 560px) {
  .ds-pv-record { --pic-w: 176px; --panel-w: 296px; --head-h: 64px; --row-h: 48px; gap: 24px; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
  .ds-pv-record[data-variant="creator"] { --row-h: 44px; }
  .ds-pv-record[data-variant="thread"] { --head-h: 56px; --row-h: 56px; --avatar: 32px; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
  .ds-pv-record[data-variant="thread"] .ds-pv-comment { gap: 12px; }
  .ds-pv-record[data-variant="thread"] .ds-pv-text { font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
  .ds-pv-record .ds-pv-panel { padding-inline: 16px; }
  .ds-pv-record .ds-pv-who > .ds-pv-mark { width: 32px; height: 32px; }
  .ds-pv-record .ds-pv-name { font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); }
}

/* Add an account: the typed handles, the status switch, then the account's row filling in. */
.ds-pv-field {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-height: 40px; margin-bottom: 16px; padding: 8px;
  border-radius: var(--ds-radius-panel); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline));
}
.ds-pv-input { height: 24px; padding-inline: 8px; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-inset); line-height: 24px; white-space: nowrap; }
.ds-pv-account { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows var(--ds-duration-slow) var(--ds-easing-loop), opacity var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-add:not([data-step="0"]) .ds-pv-account { grid-template-rows: 1fr; opacity: 1; }
.ds-pv-account > div { min-height: 0; overflow: hidden; }
.ds-pv-account-row { display: flex; align-items: center; gap: 12px; height: 48px; padding-inline: 8px; border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-raised); }
.ds-pv-account-row > .ds-pv-mark { width: 32px; height: 32px; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-pv-details { display: grid; flex: 1; min-width: 0; }
.ds-pv-bars, .ds-pv-text-block { grid-area: 1 / 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; transition: opacity var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-bars { gap: 8px; opacity: 0; }
.ds-pv-bar { width: 60%; height: 8px; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-inset); }
.ds-pv-bar + .ds-pv-bar { width: 40%; }
.ds-pv-add[data-step="1"] .ds-pv-bars { opacity: 1; }
.ds-pv-add[data-step="1"] .ds-pv-text-block { opacity: 0; }
.ds-pv-text-block > .ds-pv-name { white-space: normal; }
@container ds-pv (width < 440px) {
  .ds-pv-sheet[data-tight] { top: 16px; width: calc(100% - 32px); min-height: 100%; }
  .ds-pv-add .ds-pv-head, .ds-pv-add .ds-pv-field, .ds-pv-add .ds-pv-control { margin-bottom: 12px; }
  .ds-pv-add .ds-pv-step { font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
}
@container ds-pv (width >= 560px) {
  .ds-pv-add, .ds-pv-themes { font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
  .ds-pv-add .ds-pv-sheet, .ds-pv-themes .ds-pv-sheet { top: 20%; min-height: calc(80% + 16px); padding: 24px 16px 0; }
  .ds-pv-add .ds-pv-head, .ds-pv-themes .ds-pv-head { margin-bottom: 20px; }
  .ds-pv-add .ds-pv-field, .ds-pv-add .ds-pv-control, .ds-pv-themes .ds-pv-control { margin-bottom: 20px; }
  .ds-pv-add .ds-pv-step, .ds-pv-themes .ds-pv-step { height: 40px; }
  .ds-pv-account-row { height: 56px; }
  .ds-pv-add .ds-pv-name { font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); }
}

/* Comment themes: one theme's comments at a time under the add sheet's switch. */
.ds-pv-shares { display: grid; justify-items: end; }
.ds-pv-share { grid-area: 1 / 1; color: var(--ds-color-fg-muted); font-variant-numeric: tabular-nums; white-space: nowrap; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-pv-share[data-on] { opacity: 1; }
.ds-pv-views { display: grid; }
.ds-pv-view { grid-area: 1 / 1; display: flex; flex-direction: column; min-width: 0; opacity: 0; transition: opacity var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-view[data-on] { opacity: 1; }
.ds-pv-theme-comment { display: flex; align-items: center; gap: 8px; height: 48px; padding-inline: 8px; background: linear-gradient(var(--ds-color-edge-surface), var(--ds-color-edge-surface)) bottom / 100% var(--ds-border-hairline) no-repeat; }
.ds-pv-theme-comment .ds-pv-body > :first-child { color: var(--ds-color-fg-muted); white-space: nowrap; }
@container ds-pv (width < 440px) { .ds-pv-theme-comment { height: 40px; padding-inline: 4px; } }
@container ds-pv (width >= 560px) {
  .ds-pv-theme-comment { gap: 12px; height: 56px; padding-inline: 12px; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
  .ds-pv-theme-comment > .ds-pv-mark { width: 32px; height: 32px; }
}

/* Creator filters: the query, chips turning on, rows folding away. */
.ds-pv-query {
  display: flex; align-items: center; gap: 8px; height: 32px; margin-bottom: 12px; padding-inline: 8px; border-radius: var(--ds-radius-panel);
  outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline)); font-weight: var(--ds-font-weight-medium);
}
.ds-pv-icon { flex: none; width: 16px; height: 16px; fill: none; stroke: var(--ds-color-fg-muted); stroke-width: 1.5; stroke-linecap: round; }
.ds-pv-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
.ds-pv-chip {
  display: grid; height: 24px; padding-inline: 8px; border-radius: var(--ds-radius-sm); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface);
  outline-offset: calc(-1 * var(--ds-border-hairline)); color: var(--ds-color-fg-muted); white-space: nowrap;
  transition: background-color var(--ds-duration-micro) var(--ds-easing-loop), color var(--ds-duration-micro) var(--ds-easing-loop);
}
.ds-pv-chip[data-on] { background-color: var(--ds-color-white); color: var(--ds-color-black); }
.ds-pv-chip > span { grid-area: 1 / 1; justify-self: center; line-height: 24px; transition: opacity var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-pv-chip > span + span { opacity: 0; font-weight: var(--ds-font-weight-medium); }
.ds-pv-chip[data-on] > span:first-child { opacity: 0; }
.ds-pv-chip[data-on] > span + span { opacity: 1; }
.ds-pv-fold { display: grid; grid-template-rows: 1fr; opacity: 1; transition: grid-template-rows var(--ds-duration-slow) var(--ds-easing-loop), opacity var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-fold[data-out] { grid-template-rows: 0fr; opacity: 0; }
.ds-pv-fold > div { min-height: 0; overflow: hidden; }
.ds-pv-face { display: flex; align-items: center; gap: 8px; height: 40px; }
.ds-pv-who-col { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.ds-pv-figure { flex: none; font-variant-numeric: tabular-nums; font-weight: var(--ds-font-weight-medium); }
.ds-pv-filters .ds-pv-sheet { top: 16px; width: calc(100% - 32px); min-height: 100%; }
@container ds-pv (width >= 560px) {
  .ds-pv-filters { font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
  .ds-pv-filters .ds-pv-sheet { top: 12.5%; width: calc(100% - 96px); min-height: calc(87.5% + 16px); padding: 20px 16px 0; }
  .ds-pv-filters .ds-pv-query { height: 40px; margin-bottom: 16px; padding-inline: 12px; }
  .ds-pv-filters .ds-pv-chips { gap: 8px; margin-bottom: 16px; }
  .ds-pv-filters .ds-pv-chip { height: 32px; padding-inline: 12px; }
  .ds-pv-filters .ds-pv-chip > span { line-height: 32px; }
  .ds-pv-filters .ds-pv-face { gap: 12px; height: 48px; }
  .ds-pv-filters .ds-pv-face > .ds-pv-mark { width: 32px; height: 32px; }
  .ds-pv-filters .ds-pv-who-col > .ds-pv-sub { font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
}

/* Narrow: a search, three filters arriving, eight results dimming. */
.ds-pv-narrow { --w: 400px; --field-h: 40px; --chip-h: 24px; --gap: 12px; --tile-gap: 8px; --tile-ratio: 4 / 5; display: flex; flex-direction: column; gap: var(--gap); width: var(--w); color: var(--ds-color-fg); }
.ds-pv-search {
  display: flex; align-items: center; gap: 8px; height: var(--field-h); padding-inline: 12px; border-radius: var(--ds-radius-panel);
  outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline)); background: var(--ds-color-black);
}
.ds-pv-search > .ds-pv-ellipsis { flex: 1; }
.ds-pv-counts { display: grid; flex: none; justify-items: end; }
.ds-pv-counts > span { grid-area: 1 / 1; color: var(--ds-color-fg-muted); font-variant-numeric: tabular-nums; white-space: nowrap; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-pv-counts > [data-on] { opacity: 1; }
.ds-pv-narrow-filters { display: flex; align-items: center; gap: 8px; height: var(--chip-h); }
.ds-pv-pill {
  display: grid; place-items: center; height: var(--chip-h); padding-inline: 8px; border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-inset);
  white-space: nowrap; opacity: 0; scale: 0.9; transition: opacity var(--ds-duration-micro) var(--ds-easing-loop), scale var(--ds-duration-micro) var(--ds-easing-loop);
}
.ds-pv-pill[data-on] { opacity: 1; scale: 1; }
.ds-pv-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--tile-gap); }
.ds-pv-slot { position: relative; aspect-ratio: var(--tile-ratio); border-radius: var(--ds-radius-sm); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline)); background: var(--ds-color-surface-raised); }
.ds-pv-slot > .ds-pv-pic { transition: opacity var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-slot > .ds-pv-pic[data-out] { opacity: 0.32; }
.ds-pv-slot > .ds-pv-pic > * { transition: filter var(--ds-duration-slow) var(--ds-easing-loop), scale var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-slot > .ds-pv-pic[data-out] > * { filter: blur(8px); scale: 1.12; }
@container ds-pv (width < 440px) {
  .ds-pv-narrow { --w: calc(100% - 32px); --field-h: 32px; --gap: 8px; --tile-ratio: 1; }
  .ds-pv-search { padding-inline: 8px; }
}
@container ds-pv (width >= 560px) {
  .ds-pv-narrow { --w: 512px; --field-h: 48px; --chip-h: 32px; --gap: 16px; --tile-gap: 12px; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
  .ds-pv-search { gap: 12px; padding-inline: 16px; }
  .ds-pv-pill { padding-inline: 12px; }
}

/* Timeline: rows by posts, each run on a time axis drawn in glyphs, the window shading what falls outside. */
.ds-pv-timeline { --pic: 32px; --who-w: 136px; --count-w: 48px; --gap: 8px; }
.ds-pv-timeline .ds-pv-sheet { top: 16px; width: calc(100% - 32px); min-height: 100%; }
.ds-pv-timeline .ds-pv-head { height: 24px; margin-bottom: 12px; }
.ds-pv-timeline .ds-pv-control { margin-bottom: 8px; }
.ds-pv-timeline .ds-pv-step { font-size: inherit; line-height: inherit; }
.ds-pv-brand { display: flex; align-items: center; gap: 8px; }
.ds-pv-brand > .ds-pv-logo { width: 24px; height: 24px; }
.ds-pv-timeline .ds-pv-face { gap: var(--gap); height: 48px; }
.ds-pv-timeline .ds-pv-fold + .ds-pv-fold .ds-pv-face { background: linear-gradient(var(--ds-color-edge-surface), var(--ds-color-edge-surface)) top / 100% var(--ds-border-hairline) no-repeat; }
.ds-pv-thumb { position: relative; flex: none; width: var(--pic); height: var(--pic); }
.ds-pv-glyphs { font-family: var(--ds-font-ascii); font-size: calc(40px / 3); font-variant-ligatures: none; line-height: 16px; letter-spacing: 0; white-space: pre; }
.ds-pv-track { position: relative; display: none; flex: 1; min-width: 0; height: 8px; overflow: visible; clip-path: inset(-4px 0); color: var(--ds-color-edge-strong); line-height: 8px; }
.ds-pv-window {
  position: absolute; inset: 0; color: var(--ds-color-fg-muted);
  clip-path: inset(-4px 0 -4px round(down, calc((1 - var(--shade)) * 100%), 8px)); transition: clip-path var(--ds-duration-slow) var(--ds-easing-loop);
}
.ds-pv-run { position: absolute; top: 0; bottom: 0; left: round(down, calc(var(--start) * 100%), 8px); width: max(round(nearest, calc(var(--span) * 100%), 8px), 16px); overflow: hidden; color: var(--ds-color-fg); }
.ds-pv-count { flex: none; width: var(--count-w); text-align: right; font-variant-numeric: tabular-nums; font-weight: var(--ds-font-weight-medium); }
.ds-pv-axis {
  display: none; justify-content: space-between; margin-left: calc(var(--pic) + var(--who-w) + 2 * var(--gap)); margin-right: calc(var(--count-w) + var(--gap));
  padding-block: 8px; color: var(--ds-color-fg-muted); background: linear-gradient(var(--ds-color-edge-surface), var(--ds-color-edge-surface)) top / 100% var(--ds-border-hairline) no-repeat;
}
@container ds-pv (width >= 560px) {
  .ds-pv-timeline { --who-w: 152px; --count-w: 64px; --gap: 12px; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
  .ds-pv-timeline .ds-pv-sheet { top: 12.5%; width: calc(100% - 96px); min-height: calc(87.5% + 16px); padding: 20px 16px 0; }
  .ds-pv-timeline .ds-pv-head { margin-bottom: 16px; }
  .ds-pv-timeline .ds-pv-control { margin-bottom: 12px; }
  .ds-pv-timeline .ds-pv-step { height: 40px; }
  .ds-pv-timeline .ds-pv-face { height: 48px; }
  .ds-pv-timeline .ds-pv-who-col { flex: none; width: var(--who-w); }
  .ds-pv-timeline .ds-pv-who-col > .ds-pv-sub { font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
  .ds-pv-track { display: block; }
  .ds-pv-axis { display: flex; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
}

/* Ranked sheet: rows that move, leave and change value with a two-way switch. */
.ds-pv-sheetlist { --row-h: 52px; --thumb-w: 32px; --thumb-h: 40px; }
.ds-pv-sheet-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ds-pv-logo { position: relative; display: grid; flex: none; place-items: center; overflow: hidden; width: 20px; height: 20px; border-radius: 50%; background: var(--ds-color-white); color: var(--ds-color-black); font-size: var(--ds-text-caption); line-height: 1; font-weight: var(--ds-font-weight-medium); }
.ds-pv-logo > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.ds-pv-tray { position: relative; isolation: isolate; display: flex; flex: none; margin-left: auto; padding: 4px; border-radius: var(--ds-radius-panel); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline)); }
.ds-pv-tray-pill { position: absolute; top: 4px; left: 0; z-index: -1; width: var(--w); height: calc(100% - 8px); border-radius: var(--ds-radius-sm); background: var(--ds-color-white); translate: var(--x); transition: translate var(--ds-duration-micro) var(--ds-easing-loop), width var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-pv-tab {
  height: 32px; padding: 0 12px; border: 0; border-radius: var(--ds-radius-sm); background: none; color: var(--ds-color-fg-muted); font: inherit;
  font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); font-weight: var(--ds-font-weight-medium); white-space: nowrap; cursor: pointer;
  transition: color var(--ds-duration-micro) var(--ds-easing-loop);
}
.ds-pv-tab[aria-selected="true"] { color: var(--ds-color-black); }
.ds-pv-tab:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: calc(-1 * var(--ds-border-focus)); }
@media (hover: hover) and (pointer: fine) { .ds-pv-tab[aria-selected="false"]:hover { color: var(--ds-color-fg); } }
@media (pointer: coarse) { .ds-pv-tab { position: relative; } .ds-pv-tab::after { content: ""; position: absolute; inset: -8px 0; } }
.ds-pv-ranked { position: relative; height: calc(var(--slots) * var(--row-h)); margin: 16px 0 0; padding: 0; list-style: none; }
.ds-pv-rank {
  position: absolute; top: 0; right: 0; left: 0; z-index: 1; display: flex; align-items: center; gap: 12px; height: var(--row-h);
  background: linear-gradient(var(--ds-color-edge-surface), var(--ds-color-edge-surface)) top / 100% var(--ds-border-hairline) no-repeat, var(--ds-color-black);
  transform: translateY(calc(var(--at) * var(--row-h)));
  transition: transform var(--ds-duration-slow) var(--ds-easing-loop), opacity var(--ds-duration-slow) var(--ds-easing-loop) var(--ds-duration-slow);
}
.ds-pv-rank[data-out] { z-index: 0; opacity: 0; transition: transform var(--ds-duration-slow) var(--ds-easing-loop), opacity var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-rank-thumb { position: relative; flex: none; width: var(--thumb-w); height: var(--thumb-h); }
.ds-pv-rank-main { display: flex; flex: 1; flex-direction: column; gap: 8px; min-width: 0; }
.ds-pv-rank-line { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.ds-pv-rank-line > .ds-pv-sub { flex: none; }
.ds-pv-fill-track { position: relative; display: block; min-width: 0; height: 4px; overflow: visible; clip-path: inset(-8px 0); color: var(--ds-color-edge-strong); line-height: 4px; }
.ds-pv-fill { position: absolute; inset: 0; color: var(--ds-color-fg); clip-path: inset(-8px calc(100% - round(down, calc(var(--share) * 100%), 8px)) -8px 0); transition: clip-path var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-values { display: grid; flex: none; justify-items: end; min-width: 48px; }
.ds-pv-values > span { grid-area: 1 / 1; color: var(--ds-color-fg-soft); font-variant-numeric: tabular-nums; white-space: nowrap; opacity: 0; transition: opacity var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-values > [data-on] { opacity: 1; }
.ds-pv-rank[data-muted] .ds-pv-name-cell, .ds-pv-rank[data-muted] .ds-pv-values > span, .ds-pv-rank[data-muted] .ds-pv-fill { color: var(--ds-color-fg-faint); }
.ds-pv-rank[data-muted] .ds-pv-pic > * { filter: grayscale(1); }
@container ds-pv (width < 440px) {
  .ds-pv-sheetlist { --row-h: 44px; --thumb-w: 28px; --thumb-h: 36px; }
  .ds-pv-sheetlist .ds-pv-sheet { top: 12px; width: calc(100% - 32px); min-height: 100%; padding-top: 12px; }
  .ds-pv-sheetlist .ds-pv-note, .ds-pv-rank:not([data-muted]) .ds-pv-rank-line > .ds-pv-sub { display: none; }
  .ds-pv-tab { padding-inline: 8px; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
  .ds-pv-ranked { margin-top: 8px; }
}
@container ds-pv (width >= 560px) {
  .ds-pv-sheetlist { --row-h: 64px; --thumb-w: 40px; --thumb-h: 48px; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
  .ds-pv-sheetlist .ds-pv-sheet { top: 16%; min-height: calc(84% + 16px); padding: 24px 16px 0; }
  .ds-pv-sheet-head { gap: 12px; }
  .ds-pv-sheetlist .ds-pv-logo { width: 24px; height: 24px; }
  .ds-pv-sheet-head > .ds-pv-strong { font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); }
  .ds-pv-tab { height: 40px; padding-inline: 16px; }
  .ds-pv-rank-main { gap: 12px; }
  .ds-pv-name-cell { font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); }
}

/* Patterns: share bars by hook, angle or persona over three ads, the top ad in focus. */
.ds-pv-patterns .ds-pv-head { justify-content: flex-start; }
.ds-pv-patterns .ds-pv-head > .ds-pv-sub { margin-left: auto; }
.ds-pv-set { display: grid; gap: 8px; margin: 0 0 16px; padding: 0; list-style: none; }
.ds-pv-share-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 8px; row-gap: 4px; }
.ds-pv-share-row > .ds-pv-swap { min-width: 0; }
.ds-pv-share-row > .ds-pv-swap > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-pv-share-row > .ds-pv-swap > [data-on] { transition-delay: var(--ds-duration-micro); }
.ds-pv-share-row > .ds-pv-swap + .ds-pv-swap { justify-items: end; color: var(--ds-color-fg-soft); }
.ds-pv-bar-track { grid-column: 1 / -1; height: 4px; overflow: hidden; border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-inset); }
.ds-pv-bar-fill { display: block; height: 100%; background: var(--ds-color-white); transform-origin: left center; transition: transform var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-ads { flex: 1 1 auto; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.ds-pv-ad { position: relative; overflow: hidden; container-type: inline-size; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-raised); }
.ds-pv-ad > .ds-pv-pic > * { filter: blur(calc(100cqw * 24 / 117.4)); scale: 1.1; transition: filter var(--ds-duration-slow) var(--ds-easing-loop), scale var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-ad[data-top] > .ds-pv-pic > * { filter: blur(0); scale: 1; }
.ds-pv-badge { position: absolute; top: 8px; left: 8px; display: grid; place-items: center; width: 24px; height: 24px; border-radius: var(--ds-radius-panel); background: var(--ds-color-white); color: var(--ds-color-black); font-weight: var(--ds-font-weight-medium); opacity: 0; transition: opacity var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-pv-ad[data-top] > .ds-pv-badge { opacity: 1; }
@container ds-pv (width < 440px) {
  .ds-pv-patterns .ds-pv-sheet { top: 16px; width: calc(100% - 32px); min-height: 100%; padding-top: 12px; }
  .ds-pv-patterns .ds-pv-head, .ds-pv-patterns .ds-pv-control { margin-bottom: 8px; }
  .ds-pv-set { gap: 4px; margin-bottom: 8px; }
}

/* Links board: a 1080 board scaled to the stage, building and clearing scene by scene. */
.ds-pv-board { position: absolute; inset: 0; container: ds-pv-board / size; }
.ds-pv-canvas { --u: calc(max(100cqw, 100cqh) / 1080); --cut-x: max(0px, (100cqh - 100cqw) / 2); position: absolute; inset: 0; overflow: clip; }
.ds-pv-boardview { position: absolute; left: calc(50% - var(--u) * 540); top: calc(50% - var(--u) * 540); width: calc(var(--u) * 1080); height: calc(var(--u) * 1080); will-change: transform; }
.ds-pv-scene { position: absolute; inset: 0; }
.ds-pv-tile { position: absolute; left: calc(var(--u) * var(--x)); top: calc(var(--u) * var(--y)); width: calc(var(--u) * var(--w)); height: calc(var(--u) * var(--h)); overflow: hidden; border-radius: var(--ds-radius-sm); }
.ds-pv-tile > .ds-pv-pic { border-radius: 0; }
.ds-pv-page-ui { position: absolute; left: var(--cut-x); right: 0; bottom: 0; display: grid; justify-items: start; gap: 8px; }
.ds-pv-ads-count {
  height: 24px; margin-left: 8px; padding-inline: 8px; border-radius: var(--ds-radius-panel); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface);
  outline-offset: calc(-1 * var(--ds-border-hairline)); background: var(--ds-color-black); color: var(--ds-color-fg); line-height: 24px; white-space: nowrap;
}
.ds-pv-url-bar {
  display: flex; align-items: center; gap: 8px; justify-self: stretch; min-width: 0; height: 32px; padding-inline: 8px;
  border-top: var(--ds-border-hairline) solid var(--ds-color-edge-surface); background: var(--ds-color-black); color: var(--ds-color-fg);
  font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading);
}
.ds-pv-url-bar > .ds-pv-logo { width: 16px; height: 16px; font-size: var(--ds-text-caption); }
.ds-pv-url-bar .ds-pv-sub { color: var(--ds-color-fg-muted); }
.ds-pv-avatar { position: absolute; left: calc(var(--u) * (var(--cx) - var(--d) / 2)); top: calc(var(--u) * (var(--cy) - var(--d) / 2)); width: calc(var(--u) * var(--d)); height: calc(var(--u) * var(--d)); overflow: hidden; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-inset); }
.ds-pv-handle-chip {
  --chip-h: 24px; position: absolute; left: calc(var(--u) * var(--cx)); top: calc(var(--u) * var(--edge) - var(--chip-h) - 8px); height: var(--chip-h); padding-inline: 8px;
  border: var(--ds-border-hairline) solid var(--ds-color-edge-surface); border-radius: var(--ds-radius-panel); background: var(--ds-color-black); color: var(--ds-color-fg);
  font-size: var(--ds-text-ui); line-height: calc(var(--chip-h) - 2 * var(--ds-border-hairline)); font-weight: var(--ds-font-weight-medium); white-space: nowrap; transform: translateX(-50%);
}
@container ds-pv (width < 440px) {
  .ds-pv-handle-chip { --chip-h: 20px; font-size: var(--ds-text-caption); }
  .ds-pv-url-bar { height: 24px; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
  .ds-pv-url-bar > .ds-pv-logo, .ds-pv-url-bar .ds-pv-sub { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ds-pv-step, .ds-pv-indicator, .ds-pv-swap > *, .ds-pv-account, .ds-pv-bars, .ds-pv-text-block, .ds-pv-share, .ds-pv-view, .ds-pv-chip,
  .ds-pv-chip > span, .ds-pv-fold, .ds-pv-counts > span, .ds-pv-pill, .ds-pv-slot > .ds-pv-pic, .ds-pv-slot > .ds-pv-pic > *, .ds-pv-window,
  .ds-pv-tray-pill, .ds-pv-tab, .ds-pv-rank, .ds-pv-rank[data-out], .ds-pv-fill, .ds-pv-values > span, .ds-pv-bar-fill, .ds-pv-ad > .ds-pv-pic > *,
  .ds-pv-badge { transition: none; }
}
`
