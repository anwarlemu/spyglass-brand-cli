// The enterprise features' sketches, laid out for both flavors (generated from the site's FeatureVisuals.module.css,
// FeatureAlpha.module.css and FeatureGrid.module.css: classes prefixed ds-ef-, values mapped to brand tokens).
export const featuresCss = `
.ds-ef-demo, .ds-ef-canvas { position: absolute; inset: 0; }
.ds-ef-canvas { overflow: clip; font-size: var(--ds-text-caption); line-height: 16px; }
.ds-ef-canvas [data-off] { opacity: 0; }
.ds-ef-visual { container: feature / inline-size; }
.ds-ef-ascii { position: absolute; inset: 0; z-index: -1; pointer-events: none; background-size: var(--ds-ent-feat-ascii-tile) var(--ds-ent-feat-ascii-tile); opacity: var(--ds-ent-feat-ascii-opacity); mix-blend-mode: screen; mask-image: radial-gradient(ellipse 76% 76% at 50% 50%, transparent 40%, var(--ds-color-black) 100%); }
.ds-ef-ascii[data-feature="reports"] { mask-image: radial-gradient(ellipse 40% 32% at 100% 0%, var(--ds-color-black) 20%, transparent 100%); }
.ds-ef-glyphs { font-family: var(--ds-font-ascii); font-size: var(--ds-asset-ascii-size); font-variant-ligatures: none; line-height: 16px; letter-spacing: 0; white-space: pre; }
.ds-ef-shade { position: absolute; inset: 0; }
.ds-ef-shade[data-tone="1"] { background: linear-gradient(to bottom, var(--ds-color-neutral-4), var(--ds-color-neutral-2)); }
.ds-ef-shade[data-tone="2"] { background: linear-gradient(to bottom, var(--ds-color-neutral-5), var(--ds-color-neutral-3)); }
.ds-ef-shade[data-tone="3"] { background: linear-gradient(to bottom, var(--ds-color-neutral-6), var(--ds-color-neutral-4)); }
.ds-ef-shade[data-tone="4"] { background: linear-gradient(to bottom, var(--ds-color-neutral-7), var(--ds-color-neutral-5)); }
.ds-ef-shade img { display: block; width: 100%; height: 100%; object-fit: cover; }
.ds-ef-initial { display: grid; place-items: center; width: 100%; height: 100%; font-family: var(--ds-font-heading); color: var(--ds-color-fg); }
.ds-ef-center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--ds-ent-feat-pad);
}
.ds-ef-chip {
  display: inline-block;
  height: 24px;
  padding-inline: 8px;
  border-radius: var(--ds-radius-sm);
  background: var(--ds-color-surface-inset);
  color: var(--ds-color-fg);
  font-size: var(--ds-text-caption);
  line-height: 24px;
  white-space: nowrap;
}
.ds-ef-agents {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ds-ef-clients {
  display: flex;
  gap: 40px;
}
.ds-ef-client {
  display: grid;
  place-items: center;
  width: var(--ds-ent-feat-tile);
  height: var(--ds-ent-feat-tile);
  border-radius: var(--ds-radius-panel);
  background: var(--ds-color-black);
  outline: 1px solid var(--ds-color-edge-surface); outline-offset: -1px;
}
.ds-ef-client-glyph {
  width: var(--ds-ent-feat-glyph);
  height: var(--ds-ent-feat-glyph);
  background: var(--ds-color-white);
  mask: var(--mark) center / contain no-repeat;
}
.ds-ef-client-mark {
  display: block;
  width: var(--ds-ent-feat-glyph);
  height: var(--ds-ent-feat-glyph);
}
.ds-ef-wires {
  position: relative;
  display: block;
  width: 224px;
  height: 56px;
  color: var(--ds-color-edge-strong);
}
.ds-ef-wire-glyph {
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 16px;
  text-align: center;
}
.ds-ef-hub {
  display: grid;
  place-items: center;
  width: var(--ds-ent-feat-hub);
  height: var(--ds-ent-feat-hub);
  border-radius: var(--ds-radius-panel);
  background: var(--ds-color-black);
  outline: 1px solid var(--ds-color-edge-strong); outline-offset: -1px;
}
.ds-ef-hub-glyph {
  width: var(--ds-ent-feat-hub-glyph);
  height: 20px;
  background: var(--ds-color-white);
  mask: var(--ds-ef-logomark) center / contain no-repeat;
}
.ds-ef-hub-chip {
  margin-top: 12px;
}
.ds-ef-archive {
  --archive-app-h: calc(2 * 12px + 16px + 8px + 24px);
  --archive-pitch: calc(48px + 4px);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 320px;
  align-self: stretch;
}
.ds-ef-archive-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.ds-ef-archive-source {
  display: flex;
  gap: 4px;
}
.ds-ef-archive-meta {
  color: var(--ds-color-fg-muted);
}
.ds-ef-stream {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  contain: size;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    var(--ds-color-black) 24px,
    var(--ds-color-black) calc(100% - 32px),
    transparent
  );
}
.ds-ef-rows {
  position: absolute;
  top: calc(100% - var(--archive-app-h) - var(--archive-rest) * var(--archive-pitch));
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ds-ef-row {
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 4px 12px 4px 4px;
  border-radius: var(--ds-radius-panel);
  background: var(--ds-color-surface-subtle);
}
.ds-ef-row[data-place="above"] {
  opacity: 0.32;
}
.ds-ef-row[data-place="below"] {
  opacity: 0;
}
.ds-ef-thumb {
  position: relative;
  flex: none;
  width: 32px;
  height: 40px;
  overflow: hidden;
  border-radius: var(--ds-radius-sm);
}
.ds-ef-thumb img {
  object-fit: cover;
}
.ds-ef-row-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.ds-ef-row-brand {
  color: var(--ds-color-fg);
  font-size: var(--ds-text-ui);
  line-height: 20px;
}
.ds-ef-row-meta {
  color: var(--ds-color-fg-muted);
  font-size: var(--ds-text-caption);
  line-height: 16px;
}
.ds-ef-row-brand,
.ds-ef-row-meta {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ds-ef-status {
  flex: none;
}
.ds-ef-row .ds-ef-chip {
  background: var(--ds-color-surface-raised);
}
.ds-ef-app {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: var(--archive-app-h);
  padding: 12px;
}
.ds-ef-app-ground {
  position: absolute;
  inset: 0;
  border-radius: var(--ds-radius-panel);
  background: var(--ds-color-black);
  outline: 1px solid var(--ds-color-edge-surface); outline-offset: -1px;
}
.ds-ef-app-head {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--ds-color-fg-muted);
  font-size: var(--ds-text-caption);
  line-height: 16px;
  white-space: nowrap;
}
.ds-ef-app-value {
  color: var(--ds-color-fg);
}
.ds-ef-draft {
  position: relative;
  align-self: flex-start;
  max-width: 100%;
  overflow: hidden;
  background: var(--ds-color-white);
  color: var(--ds-color-action-primary-fg);
  text-overflow: ellipsis;
}
.ds-ef-live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.ds-ef-live::before {
  content: "";
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--ds-color-white);
}
.ds-ef-build {
  position: relative;
}
.ds-ef-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ds-ef-flow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ds-ef-step {
  display: flex;
  align-items: center;
  height: var(--ds-size-control-md);
  padding-inline: 12px;
  border-radius: var(--ds-radius-panel);
  background: var(--ds-color-surface-subtle);
  outline: 1px solid var(--ds-color-edge-surface); outline-offset: -1px;
  color: var(--ds-color-fg);
  font-size: var(--ds-text-ui);
  line-height: 20px;
  white-space: nowrap;
}
.ds-ef-link {
  display: block;
  flex: none;
  width: 8px;
  height: 16px;
  color: var(--ds-color-edge-strong);
}
.ds-ef-link-across {
  display: none;
}
@container feature (min-width: 480px) {
  .ds-ef-flow,
  .ds-ef-flow-item {
    flex-direction: row;
  }
  .ds-ef-link {
    width: 24px;
  }
  .ds-ef-link-across {
    display: inline;
  }
  .ds-ef-link-down {
    display: none;
  }
}
.ds-ef-cursor {
  position: absolute;
  top: 100%;
  left: 0;
  width: var(--ds-ent-feat-cursor);
  height: var(--ds-ent-feat-cursor);
  pointer-events: none;
}
.ds-ef-cursor-us {
  left: 100%;
}
.ds-ef-arrow {
  display: block;
  width: var(--ds-ent-feat-cursor);
  height: var(--ds-ent-feat-cursor);
  overflow: visible;
  stroke-width: 2;
  stroke-linejoin: round;
}
.ds-ef-cursor-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  height: 24px;
  padding-inline: 8px;
  border-radius: var(--ds-radius-panel);
  font-size: var(--ds-text-caption);
  font-weight: 500;
  line-height: 24px;
  white-space: nowrap;
}
@container feature (width < 480px) {
  .ds-ef-cursor-tag {
    top: 0;
    left: 16px;
  }
  .ds-ef-cursor-us .ds-ef-cursor-tag {
    top: 24px;
    right: 0;
    left: auto;
  }
}
.ds-ef-cursor-you .ds-ef-arrow {
  fill: var(--ds-color-white);
  stroke: var(--ds-color-white);
}
.ds-ef-cursor-you .ds-ef-cursor-tag {
  background: var(--ds-color-white);
  color: var(--ds-color-action-primary-fg);
}
.ds-ef-cursor-us .ds-ef-arrow {
  fill: var(--ds-color-neutral-9);
  stroke: var(--ds-color-neutral-9);
}
.ds-ef-cursor-us .ds-ef-cursor-tag {
  background: var(--ds-color-surface-hover);
  color: var(--ds-color-fg);
}
.ds-ef-reports {
  position: absolute;
  inset: 0;
  mask-image: linear-gradient(
    to bottom,
    var(--ds-color-black) calc(100% - var(--ds-ent-feat-report-fade)),
    transparent
  );
}
.ds-ef-report-layer {
  position: absolute;
  inset: 0;
}
.ds-ef-report-layer[data-wait] {
  transform: translateY(calc(var(--ds-ent-feat-report-travel) * 100%));
}
.ds-ef-report-ad {
  position: absolute;
  overflow: hidden;
  border-radius: var(--ds-radius-sm);
}
.ds-ef-report-img {
  object-fit: cover;
  filter: grayscale(var(--ds-ent-feat-report-grey)) brightness(var(--ds-ent-feat-report-bright));
}
.ds-ef-report-tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: var(--ds-color-surface-raised);
}
.ds-ef-bar-anchor {
  position: absolute;
  left: 50%;
  top: calc(50% - min(100cqw, var(--ds-ent-feat-visual-h)) * 5 / 1080);
  z-index: 1;
  width: max-content;
  max-width: calc(100% - 2 * 16px);
  translate: -50% -50%;
}
.ds-ef-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--ds-size-control-md);
  padding-inline: 8px;
  overflow: hidden;
  border-radius: var(--ds-radius-panel);
  background: var(--ds-color-black);
  outline: 1px solid var(--ds-color-edge-surface); outline-offset: -1px;
  color: var(--ds-color-fg);
  font-size: var(--ds-text-ui);
  line-height: 20px;
  font-weight: var(--ds-font-weight-medium);
  white-space: nowrap;
}
.ds-ef-bar-well {
  display: grid;
  flex: none;
  place-items: center;
  width: 24px;
  height: 24px;
}
.ds-ef-bar-glyph {
  width: 24px;
  height: 24px;
  background: var(--ds-color-fg);
  mask: var(--ds-ef-chat) center / contain no-repeat;
}
.ds-ef-bar-labels {
  display: grid;
  min-width: 0;
}
.ds-ef-bar-labels > * {
  grid-area: 1 / 1;
}
.ds-ef-bar-sizer {
  overflow: hidden;
  white-space: nowrap;
  visibility: hidden;
}
.ds-ef-bar-channel {
  flex: none;
  height: 24px;
  padding-inline: 8px;
  border-radius: var(--ds-radius-sm);
  background: var(--ds-color-surface-inset);
  color: var(--ds-color-fg-soft);
  font-size: var(--ds-text-caption);
  font-weight: var(--ds-font-weight-regular);
  line-height: 24px;
}
@container feature (width < 280px) {
  .ds-ef-bar-channel {
    display: none;
  }
}
@container feature (width >= 480px) {
  .ds-ef-bar {
    gap: 12px;
    height: var(--ds-size-control-lg);
    padding-inline: 12px;
    font-size: var(--ds-text-body-lg);
    line-height: 28px;
  }
  .ds-ef-bar-well {
    width: 32px;
    height: 32px;
  }
  .ds-ef-bar-glyph {
    width: 24px;
    height: 24px;
  }
  .ds-ef-bar-channel {
    height: 32px;
    padding-inline: 12px;
    font-size: var(--ds-text-ui);
    line-height: 32px;
  }
}
.ds-ef-data {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: var(--ds-color-fg-muted);
}
.ds-ef-data-cell {
  position: relative;
  display: inline-block;
  width: 8px;
  height: 16px;
  text-align: center;
}
.ds-ef-data-lit {
  position: absolute;
  inset: 0;
  color: var(--ds-color-white);
  opacity: 0;
}
.ds-ef-data-branch {
  display: flex;
  align-items: center;
  height: 24px;
}
.ds-ef-data-turn,
.ds-ef-data-drop {
  padding-left: 28px;
}
.ds-ef-data-ask {
  margin-left: 4px;
  color: var(--ds-color-fg-soft);
}
.ds-ef-data-answer {
  position: relative;
  margin-left: 4px;
  color: var(--ds-color-fg-muted);
}
.ds-ef-data-answer-lit {
  position: absolute;
  inset: 0;
  padding-inline: 8px;
  border-radius: inherit;
  background: var(--ds-color-white);
  color: var(--ds-color-black);
}
.ds-ef-data-drop {
  display: flex;
  flex-direction: column;
}
.ds-ef-data-row {
  display: flex;
  align-items: flex-start;
}
.ds-ef-data-link {
  display: flex;
  align-items: center;
  height: var(--ds-ent-feat-hub);
}
.ds-ef-data-tool {
  position: relative;
}
.ds-ef-data-name {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  translate: -50% 0;
  color: var(--ds-color-fg-muted);
  font-size: var(--ds-text-caption);
  line-height: 16px;
  white-space: nowrap;
}
.ds-ef-data-hub {
  display: grid;
  flex: none;
  place-items: center;
  width: var(--ds-ent-feat-hub);
  height: var(--ds-ent-feat-hub);
  border-radius: var(--ds-radius-panel);
  background: var(--ds-color-black);
  outline: 1px solid var(--ds-color-fg-muted); outline-offset: -1px;
}
.ds-ef-data-hub-glyph {
  width: var(--ds-ent-feat-hub-glyph);
  height: 20px;
  background: var(--ds-color-white);
  mask: var(--ds-ef-logomark) center / contain no-repeat;
}
@container feature (width < 368px) {
  .ds-ef-data-link [data-dash]:nth-child(n + 4) {
    display: none;
  }
}
@container feature (width < 320px) {
  .ds-ef-data {
    --ent-feat-hub: 48px;
    --ent-feat-hub-glyph: 32px;
  }
  .ds-ef-data-link [data-dash]:nth-child(n + 3) {
    display: none;
  }
  .ds-ef-data-turn,
  .ds-ef-data-drop {
    padding-left: 20px;
  }
}
.ds-ef-builds {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 288px;
}
.ds-ef-build-tabs {
  display: flex;
  gap: 16px;
  padding-inline: 4px;
}
.ds-ef-build-tab {
  position: relative;
  color: var(--ds-color-fg-muted);
  font-size: var(--ds-text-caption);
  line-height: 16px;
}
.ds-ef-build-tab-lit {
  position: absolute;
  inset: 0;
  color: var(--ds-color-fg);
  opacity: 0;
}
.ds-ef-build-tab:first-child .ds-ef-build-tab-lit {
  opacity: 1;
}
.ds-ef-build-stage {
  padding: 16px;
  border-radius: var(--ds-radius-panel);
  background: var(--ds-color-surface-subtle);
}
.ds-ef-build-body {
  display: grid;
}
.ds-ef-build-panel {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  min-width: 0;
  opacity: 0;
}
.ds-ef-build-panel:first-child {
  opacity: 1;
}
.ds-ef-build-caption {
  color: var(--ds-color-fg-muted);
  font-size: var(--ds-text-caption);
  line-height: 16px;
}
.ds-ef-build-tool {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
  vertical-align: top;
}
.ds-ef-build-tool-mark {
  width: 12px;
  height: 12px;
  background: currentColor;
  mask: var(--mark) center / contain no-repeat;
}
.ds-ef-build-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ds-ef-bar-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) 32px;
  align-items: center;
  gap: 8px;
  height: 32px;
}
.ds-ef-bar-label {
  overflow: hidden;
  color: var(--ds-color-fg-soft);
  font-size: var(--ds-text-caption);
  line-height: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ds-ef-bar-track {
  height: 8px;
  border-radius: var(--ds-radius-sm);
  background: var(--ds-color-edge-surface);
}
.ds-ef-bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--ds-color-fg-muted);
}
.ds-ef-bar-fill[data-top] {
  background: var(--ds-color-white);
}
.ds-ef-bar-value {
  color: var(--ds-color-fg);
  font-size: var(--ds-text-caption);
  line-height: 16px;
  text-align: right;
}
.ds-ef-creator-row {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 32px;
}
.ds-ef-creator-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.ds-ef-creator-name {
  color: var(--ds-color-fg);
  font-size: var(--ds-text-caption);
  line-height: 16px;
}
.ds-ef-creator-note {
  color: var(--ds-color-fg-muted);
  font-size: var(--ds-text-caption);
  line-height: 16px;
}
.ds-ef-build-avatar {
  position: relative;
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.ds-ef-build-avatar img {
  object-fit: cover;
}
.ds-ef-build-check {
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--ds-color-fg);
}
.ds-ef-hook-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}
.ds-ef-review {
  color: var(--ds-color-fg);
  font-size: var(--ds-text-ui);
  line-height: 20px;
}
.ds-ef-hook-link {
  color: var(--ds-color-fg-muted);
}
.ds-ef-hook-chip {
  background: var(--ds-color-white);
  color: var(--ds-color-black);
}
.ds-ef-hook-rivals {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.ds-ef-hook-ads {
  display: flex;
}
.ds-ef-hook-ad {
  position: relative;
  width: 24px;
  height: 32px;
  overflow: hidden;
  border-radius: var(--ds-radius-sm);
  outline: 1px solid var(--ds-color-surface-subtle);
}
.ds-ef-hook-ad + .ds-ef-hook-ad {
  margin-left: calc(-1 * 8px);
}
.ds-ef-hook-ad img {
  object-fit: cover;
}
.ds-ef-tools {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 288px;
}
.ds-ef-tool-ask {
  max-width: 100%;
  overflow: hidden;
  color: var(--ds-color-fg-soft);
  text-overflow: ellipsis;
}
.ds-ef-tool-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border-radius: var(--ds-radius-panel);
  background: var(--ds-color-surface-subtle);
}
.ds-ef-tool-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: var(--ds-text-caption);
  line-height: 16px;
  white-space: nowrap;
}
.ds-ef-tool-name {
  color: var(--ds-color-fg);
}
.ds-ef-tool-metric {
  color: var(--ds-color-fg-muted);
}
.ds-ef-tool-chart {
  display: grid;
  grid-template-columns: repeat(3, 64px);
  justify-content: center;
  color: var(--ds-color-fg-muted);
}
.ds-ef-tool-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-row: 1;
  align-self: end;
}
.ds-ef-tool-value,
.ds-ef-tool-label {
  position: relative;
  color: var(--ds-color-fg-muted);
  font-size: var(--ds-text-caption);
  line-height: 16px;
  white-space: nowrap;
}
.ds-ef-tool-stack {
  position: relative;
  display: flex;
  flex-direction: column;
}
.ds-ef-tool-stack-lit {
  position: absolute;
  inset: 0;
  color: var(--ds-color-white);
}
.ds-ef-tool-axis {
  grid-column: 1 / -1;
  grid-row: 2;
}
.ds-ef-tool-label {
  grid-row: 3;
  justify-self: center;
}
.ds-ef-tool-text-lit {
  position: absolute;
  inset: 0;
  color: var(--ds-color-fg);
}
.ds-ef-tool-tag {
  display: flex;
  gap: 4px;
}
.ds-ef-tool-by {
  color: var(--ds-color-fg-muted);
}
.ds-ef-a-stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--ds-ent-feat-pad);
}
.ds-ef-a-alpha {
  --alpha-side-w: 48px;
  --alpha-side-h: calc(12px * 5);
  --alpha-mid-w: 64px;
  --alpha-mid-h: 80px;
  --alpha-slot-w: var(--ds-ent-feat-thumb-w);
  --alpha-slot-h: var(--ds-ent-feat-thumb-h);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 100%;
}
.ds-ef-a-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
}
.ds-ef-a-label {
  margin-bottom: 8px;
  color: var(--ds-color-fg-muted);
  white-space: nowrap;
}
.ds-ef-a-ads {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ds-ef-a-ad {
  position: relative;
  flex: none;
  width: var(--alpha-side-w);
  height: var(--alpha-side-h);
  overflow: hidden;
  border-radius: var(--ds-radius-sm);
  background: var(--ds-color-surface-inset);
}
.ds-ef-a-ad:nth-child(2) {
  width: var(--alpha-mid-w);
  height: var(--alpha-mid-h);
}
.ds-ef-a-img {
  object-fit: cover;
}
.ds-ef-a-exchange {
  position: relative;
  display: grid;
  justify-items: center;
  max-width: 100%;
  margin-top: calc(12px * -1);
}
.ds-ef-a-ask,
.ds-ef-a-answer {
  grid-area: 1 / 1;
  max-width: 100%;
  height: 24px;
  padding-inline: 8px;
  overflow: hidden;
  border-radius: var(--ds-radius-sm);
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ds-ef-a-ask {
  background: var(--ds-color-surface-inset);
  color: var(--ds-color-fg-soft);
  opacity: 0;
}
.ds-ef-a-answer {
  background: var(--ds-color-white);
  color: var(--ds-color-black);
}
.ds-ef-a-spyglass {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ds-color-fg);
}
.ds-ef-a-mark {
  flex: none;
  width: 24px;
  height: 12px;
  background: currentColor;
  mask: var(--ds-ef-logomark) center / contain no-repeat;
}
.ds-ef-a-slots {
  display: flex;
  gap: 8px;
}
.ds-ef-a-slot {
  position: relative;
  width: var(--alpha-slot-w);
  height: var(--alpha-slot-h);
  border: 1px dashed var(--ds-color-edge-strong);
  border-radius: var(--ds-radius-sm);
}
.ds-ef-a-copy {
  position: absolute;
  inset: calc(1px * -1);
  overflow: hidden;
  border-radius: var(--ds-radius-sm);
  opacity: 0;
}
.ds-ef-a-layer {
  position: absolute;
  inset: 0;
}
.ds-ef-a-blurred {
  inset: calc(4px / -2);
  filter: blur(4px);
  opacity: 0;
}
.ds-ef-a-status {
  display: grid;
  justify-items: center;
  margin-top: 8px;
  white-space: nowrap;
}
.ds-ef-a-answering,
.ds-ef-a-deleted {
  grid-area: 1 / 1;
}
.ds-ef-a-answering {
  color: var(--ds-color-fg-muted);
  opacity: 0;
}
.ds-ef-a-deleted {
  color: var(--ds-color-fg-soft);
}
@media (min-width: 1024px) {
  @container feature (width >= 320px) {
    .ds-ef-a-alpha {
      --alpha-side-w: 64px;
      --alpha-side-h: 80px;
      --alpha-mid-w: 80px;
      --alpha-mid-h: calc(20px * 5);
      --alpha-slot-w: 48px;
      --alpha-slot-h: calc(12px * 5);
    }
  }
}

.ds-ef-build-avatar { overflow: hidden; background: var(--ds-color-surface-inset); color: var(--ds-color-fg); font-size: var(--ds-text-caption); line-height: 16px; }
.ds-ef-visual { position: relative; isolation: isolate; flex: none; height: var(--ds-ent-feat-visual-h); overflow: clip; background: var(--ds-color-surface-raised); }
@media (min-width: 1024px) { .ds-ef-visual { height: var(--ds-ent-feat-visual-h-lg); } }
@media (min-width: 1024px) { .ds-ef-card { grid-column: span 2; } .ds-ef-card:nth-child(4), .ds-ef-card:nth-child(5) { grid-column: span 3; } }
.ds-ef-head { text-box: trim-start cap alphabetic; }
.ds-ef-client .ds-ef-initial { font-size: var(--ds-text-heading-4); line-height: 24px; }
`
