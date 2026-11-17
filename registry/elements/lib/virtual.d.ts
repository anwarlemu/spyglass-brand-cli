// Modules the elements build (scripts/build-elements.mjs) provides.

/** This file's own sheet: Tailwind compiled at build time from the classes in the importing file, with the brand
 * theme, plus the CSS in a sibling `<name>.css` (unlayered, as a Vue <style> block is; `@apply` works there). */
declare module 'virtual:tw' {
	import type { CSSResult } from 'lit'
	const styles: CSSResult
	export default styles
}

/** The shared base sheet: preflight and the brand's element defaults, scoped to the shadow root. */
declare module 'virtual:ds-base' {
	import type { CSSResult } from 'lit'
	const styles: CSSResult
	export default styles
}

/** Tailwind's @property registrations, which a shadow root ignores, registered on the document instead. */
declare module 'virtual:ds-properties' {
	const properties: PropertyDefinition[]
	export default properties
}
