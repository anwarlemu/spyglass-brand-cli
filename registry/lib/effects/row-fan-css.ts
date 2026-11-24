// The row fan's look (pages/TemplatesPage/TemplateCities.module.css), shared by both flavors: names in Funnel Display
// (32, 44 from 768, 64 from 1024), cards 72, 96 and 128 turned in perspective, the open card's chrome, the CTA under the
// name. Below 1024 the cards fan below the name; from 1024 beside it. Timings are the brand's steps.
export const ROW_FAN_CSS = `
.ds-fan {
  position: relative;
  --fan-layout: below; --fan-scroll: always; --fan-scroll-pick: nearest;
  --fan-card: var(--ds-fan-card); --fan-gap: var(--ds-space-sm); --fan-name-gap: var(--ds-space-2xl); --fan-below-gap: var(--ds-fan-below-gap);
  --fan-lift: var(--ds-space-lg); --fan-cta-top: var(--ds-fan-cta-top); --fan-cta-rise: var(--ds-space-sm); --fan-cta-sink: var(--ds-space-sm);
  --fan-card-pad: var(--ds-space-sm); --fan-enter-scale: var(--ds-fan-enter-scale); --fan-exit-scale: var(--ds-fan-enter-scale);
  --fan-dur-pop: var(--ds-duration-enter); --fan-dur-exit: var(--ds-duration-exit);
  --fan-dur-travel-min: var(--ds-duration-micro); --fan-dur-travel-max: var(--ds-duration-slow);
  --fan-dur-lift: var(--ds-duration-enter); --fan-dur-settle: var(--ds-duration-micro);
  --fan-dur-cta-delay: var(--ds-duration-stagger); --fan-dur-cta-out: var(--ds-duration-exit);
  --fan-dur-fade: var(--ds-duration-press); --fan-dur-fade-out: var(--ds-duration-exit);
  --fan-ease-pop: var(--ds-easing-fan-pop); --fan-ease-travel: var(--ds-easing-fan-travel);
  --fan-ease-lift: var(--ds-easing-fan-lift); --fan-ease-cta-out: var(--ds-easing-fan-cta-out);
  --fan-name-size: var(--ds-text-heading-2); --fan-name-line: var(--ds-text-heading-2-leading); --fan-row-gap: 0px; --fan-row-pad: var(--ds-space-lg);
}
.ds-fan-list { display: flex; flex-direction: column; gap: var(--fan-row-gap); margin: 0; padding: 0; list-style: none; }
.ds-fan-row { display: flex; justify-content: center; padding-top: var(--fan-row-pad); padding-bottom: calc(var(--fan-row-pad) + var(--fan-below-gap) + var(--fan-card)); color: var(--ds-color-fg); text-decoration: none; outline: none; -webkit-tap-highlight-color: transparent; }
.ds-fan-anchor { display: inline-block; }
.ds-fan-name { display: inline-block; font-family: var(--ds-font-heading); font-weight: var(--ds-font-weight-regular); font-size: var(--fan-name-size); line-height: var(--fan-name-line); white-space: nowrap; will-change: transform; }
.ds-fan-row:focus-visible .ds-fan-name { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: var(--ds-space-sm); }
.ds-fan-layer { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: visible; }
.ds-fan-slot { position: absolute; top: 0; left: 0; width: var(--fan-card); height: var(--fan-card); opacity: 0; pointer-events: none; will-change: transform, opacity; }
.ds-fan-slot[data-open] { z-index: 2000 !important; }
.ds-fan-turn { position: absolute; inset: 0; --turn: var(--ds-fan-turn); transform: perspective(var(--ds-fan-perspective)) rotateY(var(--turn)); }
.ds-fan-slot[data-side="r"] .ds-fan-turn { --turn: calc(var(--ds-fan-turn) * -1); }
.ds-fan-slot[data-step="0"][data-side="l"] .ds-fan-turn { --turn: var(--ds-fan-turn-0); }
.ds-fan-slot[data-step="0"][data-side="r"] .ds-fan-turn { --turn: calc(var(--ds-fan-turn-0) * -1); }
.ds-fan-slot[data-step="1"][data-side="l"] .ds-fan-turn { --turn: var(--ds-fan-turn-1); }
.ds-fan-slot[data-step="1"][data-side="r"] .ds-fan-turn { --turn: calc(var(--ds-fan-turn-1) * -1); }
.ds-fan-chrome { position: absolute; top: 0; left: 0; right: 0; height: var(--fan-open-h, var(--fan-card)); border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-subtle); opacity: 0; clip-path: inset(0 0 calc(100% - var(--fan-card)) 0 round var(--ds-radius-panel)); transition: opacity var(--ds-duration-enter) var(--ds-easing-in-out), clip-path var(--ds-duration-enter) var(--ds-easing-in-out); }
.ds-fan-pic { position: absolute; inset: 0; overflow: hidden; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-subtle); transform-origin: top center; transition: transform var(--ds-duration-enter) var(--ds-easing-in-out); }
.ds-fan-img { position: absolute; inset: 0; opacity: 0; transition: opacity var(--ds-duration-enter) var(--ds-easing-fan-pop) var(--ds-duration-stagger); }
.ds-fan-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; user-select: none; }
.ds-fan-img[data-on] { opacity: 1; }
[data-instant] .ds-fan-img { transition: none; }
.ds-fan-details { position: absolute; top: calc(var(--fan-card-pad) + var(--fan-card) * var(--ds-fan-card-scale) + var(--ds-space-sm)); left: var(--fan-card-pad); right: var(--fan-card-pad); display: grid; opacity: 0; transform: translateY(var(--ds-space-sm)); text-align: left; transition: opacity var(--ds-duration-enter) var(--ds-easing-in-out), transform var(--ds-duration-enter) var(--ds-easing-in-out); }
.ds-fan-title { overflow: hidden; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); color: var(--ds-color-fg); white-space: nowrap; text-overflow: ellipsis; }
.ds-fan-meta { font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); color: var(--ds-color-fg-muted); opacity: 0; transform: translateY(var(--ds-space-sm)); transition: opacity var(--ds-duration-enter) var(--ds-easing-in-out), transform var(--ds-duration-enter) var(--ds-easing-in-out); }
.ds-fan-slot[data-open] .ds-fan-chrome { opacity: 1; clip-path: inset(0 0 0 0 round var(--ds-radius-panel)); transition: opacity var(--ds-duration-glide) var(--ds-easing-fan-lift), clip-path var(--ds-duration-glide) var(--ds-easing-fan-lift); }
.ds-fan-slot[data-open] .ds-fan-pic { transform: translateY(var(--fan-card-pad)) scale(var(--ds-fan-card-scale)); transition: transform var(--ds-duration-glide) var(--ds-easing-fan-lift); }
.ds-fan-slot[data-open] .ds-fan-details, .ds-fan-slot[data-open] .ds-fan-meta { opacity: 1; transform: none; transition: opacity var(--ds-duration-glide) var(--ds-easing-fan-lift), transform var(--ds-duration-glide) var(--ds-easing-fan-lift); }
.ds-fan-slot[data-open] .ds-fan-meta { transition-delay: var(--ds-duration-stagger); }
.ds-fan-slot[data-fast] .ds-fan-chrome, .ds-fan-slot[data-fast] .ds-fan-pic, .ds-fan-slot[data-fast] .ds-fan-details, .ds-fan-slot[data-fast] .ds-fan-meta { transition-duration: var(--ds-duration-press); }
.ds-fan-cta { position: absolute; top: 0; left: 0; display: inline-flex; align-items: center; gap: var(--ds-space-sm); max-width: calc(100% - 2 * var(--ds-layout-gutter)); padding: var(--ds-space-xs) var(--ds-space-md); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); color: var(--ds-color-fg-muted); text-align: center; text-wrap: balance; opacity: 0; will-change: transform, opacity; }
@media (min-width: 768px) {
  .ds-fan { --fan-card: var(--ds-fan-card-md); --fan-gap: var(--ds-space-md); --fan-name-size: var(--ds-text-heading-1); --fan-name-line: var(--ds-text-heading-1-leading); --fan-below-gap: var(--ds-space-xl); }
  .ds-fan-cta { max-width: none; font-size: var(--ds-text-body-lg); line-height: var(--ds-text-body-lg-leading); white-space: nowrap; }
}
@media (min-width: 1024px) {
  .ds-fan { --fan-layout: side; --fan-card: var(--ds-fan-card-lg); --fan-gap: var(--ds-space-lg); --fan-name-size: var(--ds-text-display-s); --fan-name-line: var(--ds-text-display-s-leading); --fan-row-gap: calc(var(--ds-space-lg) + var(--ds-space-xl)); }
  .ds-fan-row { padding-bottom: var(--fan-row-pad); }
}
@media (prefers-reduced-motion: reduce) {
  .ds-fan-chrome, .ds-fan-pic, .ds-fan-details, .ds-fan-meta,
  .ds-fan-slot[data-open] .ds-fan-chrome, .ds-fan-slot[data-open] .ds-fan-pic, .ds-fan-slot[data-open] .ds-fan-details, .ds-fan-slot[data-open] .ds-fan-meta { transition-duration: var(--ds-duration-press); }
}
`
