// The light image's CSS (effect/LightImage/LightImage.module.css), shared by both flavors: the picture fills the box;
// the lens canvas replaces it once WebGL draws (data-gl on the box); the grain canvas fades in over 480ms when drawn.
export const LIGHT_IMAGE_CSS = (box: string, lit: string) => `
${box} { pointer-events: none; user-select: none; }
${box} > .ds-light-picture { display: block; width: 100%; max-width: none; height: 100%; }
${box} > .ds-light-lens { position: absolute; top: 0; display: none; height: 100%; }
${lit} > .ds-light-picture { visibility: hidden; }
${lit} > .ds-light-lens { display: block; }
${box} > .ds-light-grain { position: absolute; display: none; max-width: none; pointer-events: none; transition: opacity var(--ds-duration-slow) var(--ds-easing-out); }
${box} > .ds-light-grain[data-on] { display: block; }
@starting-style { ${box} > .ds-light-grain[data-on] { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { ${box} > .ds-light-grain { transition: none; } }
`
