import { LOGOS } from '@/lib/logos'

// The wordmark glow's look (effect/WordmarkGlow/WordmarkGlow.effect.module.css), shared by both flavors: the dot grid
// fading in over 128px from the top, the spectrum (Blue, Green, Yellow, Orange, Red, Cyan) swept round a point above
// the wordmark, shown through the dots and the letters only where the pointer's circle is. Reduced motion: no dots, the
// letters lit still around the sweep's centre.
export const GLOW_CSS = `
.ds-glow-grid, .ds-glow-dots, .ds-glow-letters { position: absolute; inset: 0; pointer-events: none; }
.ds-glow-grid {
  mask-image: linear-gradient(transparent, var(--ds-color-black) var(--ds-glow-dot-fade));
  background-image: radial-gradient(circle, var(--ds-glow-dot-color) 1px, transparent 1px);
  background-position: var(--ds-glow-dot-offset) var(--ds-glow-dot-offset);
  background-size: var(--ds-glow-dot-pitch) var(--ds-glow-dot-pitch);
}
.ds-glow-dots, .ds-glow-letters {
  background-image: repeating-conic-gradient(from 0deg at var(--glow-at, 50% 50%), var(--ds-color-blue) 0deg, var(--ds-color-green) 15deg, var(--ds-color-yellow) 30deg, var(--ds-color-orange) 45deg, var(--ds-color-red) 60deg, var(--ds-color-cyan) 75deg, var(--ds-color-blue) 90deg);
  opacity: var(--ds-glow-strength);
  mix-blend-mode: screen;
  mask-repeat: repeat, no-repeat;
  mask-composite: intersect;
  mask-position: var(--ds-glow-dot-offset) var(--ds-glow-dot-offset), 50% 50%;
  transition: mask-position var(--ds-duration-slow) var(--ds-easing-glow), mask-size var(--ds-duration-slow) var(--ds-easing-glow);
}
.ds-glow-dots {
  mask-image: radial-gradient(circle, var(--ds-color-white) 1px, transparent 2px), linear-gradient(transparent, var(--ds-color-black) var(--ds-glow-dot-fade)), radial-gradient(circle closest-side, var(--ds-color-black) 0%, transparent 75%);
  mask-repeat: repeat, no-repeat, no-repeat;
  mask-position: var(--ds-glow-dot-offset) var(--ds-glow-dot-offset), 0 0, 50% 50%;
  mask-size: var(--ds-glow-dot-pitch) var(--ds-glow-dot-pitch), 100% 100%, 0 0;
}
.ds-glow-letters {
  --glow-at: 50% calc(50% - 100cqi * var(--ds-glow-centre));
  mask-image: var(--ds-glow-wordmark), radial-gradient(circle closest-side, var(--ds-color-black) 0%, transparent 75%);
  mask-repeat: no-repeat;
  mask-position: 0 0, 50% 50%;
  mask-size: 100% 100%, 0 0;
}
@media (prefers-reduced-motion: reduce) {
  .ds-glow-letters { mask-size: 100% 100%, calc(2 * var(--ds-footer-glow-radius)) calc(2 * var(--ds-footer-glow-radius)); transition: none; }
  .ds-glow-dots { display: none; }
}
`

/** The wordmark as a mask image (the letters' shape). */
export function wordmarkMask(): string {
	const w = LOGOS.wordmark
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.width} ${w.height}">${w.body}</svg>`
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
