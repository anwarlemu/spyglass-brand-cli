// An image slot: what every picture in the library takes in place of its placeholder, in both flavors. `src` is the
// image (the user's own, used as posted), `alt` what it shows ('' when it is decoration), `fit` how it fills its box
// (object-fit: cover by default) and `position` where it is anchored (object-position, for example "50% 20%" or
// "top"). Without `src` an item keeps its placeholder, and every placeholder carries `data-ds-placeholder`, so a page
// can be checked for pictures still to fill.

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'

export interface ImageSlot {
	/** The image. */
	src?: string
	/** What it shows; empty when it is decoration. */
	alt?: string
	/** How it fills its box (object-fit); cover by default. */
	fit?: ImageFit
	/** Where it is anchored in its box (object-position), for example "50% 20%" or "top". */
	position?: string
}

/** The attribute every placeholder carries (a picture still to fill). */
export const PLACEHOLDER_ATTR = 'data-ds-placeholder'

/** The object-fit and object-position an image asks for, as a style object both flavors take; undefined when it asks for neither. */
export function imageFit(slot?: { fit?: ImageFit; position?: string } | null): { objectFit?: ImageFit; objectPosition?: string } | undefined {
	if (!slot || (!slot.fit && !slot.position)) return undefined
	return { ...(slot.fit ? { objectFit: slot.fit } : {}), ...(slot.position ? { objectPosition: slot.position } : {}) }
}

/** The same as a style attribute's text, for markup written as a string; '' when it asks for neither. */
export function imageFitText(slot?: { fit?: ImageFit; position?: string } | null): string {
	if (!slot) return ''
	return [slot.fit ? `object-fit: ${slot.fit}` : '', slot.position ? `object-position: ${slot.position}` : ''].filter(Boolean).join('; ')
}

/** A string or a slot as a slot (lists of pictures take either). */
export const toSlot = (v?: string | ImageSlot | null): ImageSlot => (typeof v === 'string' ? { src: v } : v ?? {})

/**
 * The page's sections in the order given: the keys it knows, each once, in the order listed; the page's own order when
 * none is given. Leave a key out to omit that section.
 */
export function pageSections<K extends string>(all: readonly K[], given?: readonly string[] | null): K[] {
	if (!Array.isArray(given)) return [...all]
	const out: K[] = []
	for (const k of given) if ((all as readonly string[]).includes(k) && !out.includes(k as K)) out.push(k as K)
	return out
}

/** Whether a src is a placeholder: none, or a generated blank that carries the placeholder attribute in its markup. */
export const isPlaceholderSrc = (src?: string) => !src || src.includes(PLACEHOLDER_ATTR)
