// When the site's pointer effects run (effect/finePointer): a mouse or a pen that hovers, on a screen 768 wide or more.
// Touch, a coarse pointer or a narrow screen gets the still picture.
export const FINE_POINTER = '(hover: hover) and (pointer: fine) and (min-width: 768px)'
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export const isFinePointer = () => !!globalThis.matchMedia && globalThis.matchMedia(FINE_POINTER).matches
export const prefersReducedMotion = () => !!globalThis.matchMedia && globalThis.matchMedia(REDUCED_MOTION).matches
/** Pointer effects run: a fine pointer and no reduced motion. */
export const pointerEffectsOn = () => isFinePointer() && !prefersReducedMotion()
