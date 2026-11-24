// The dispersion field's CSS (effect/DispersionField.module.css), shared by both flavors: the still frames show from 1024
// wide until the field's canvas has drawn (data-ready), then fade out over 160ms.
export const FIELD_CSS = (canvas: string) => `
.ds-field-still { display: none; }
@media (min-width: 1024px) { .ds-field-still { display: block; object-fit: fill; transition: opacity var(--ds-duration-micro) var(--ds-easing-out); } }
${canvas}[data-ready] ~ picture > .ds-field-still { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .ds-field-still { transition: none; } }
`

/** A transparent pixel: the still's src until a source matches. */
export const NO_PICTURE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
