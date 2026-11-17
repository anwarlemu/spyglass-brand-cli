import { LitElement, type CSSResultGroup, type ReactiveController, type ReactiveControllerHost, type PropertyDeclaration, type PropertyDeclarations, type PropertyValues } from 'lit'
import { literal, unsafeStatic, type StaticValue } from 'lit/static-html.js'
import base from 'virtual:ds-base'
import properties from 'virtual:ds-properties'

// The base every element builds on. Its shadow root gets the shared base sheet (Tailwind's preflight and the brand's
// element defaults: hairline borders, the focus ring, selection), and the element adds its own sheet, compiled at
// build time from the classes in its file (`import styles from 'virtual:tw'`). Tokens arrive through the inherited
// --ds-* variables, so brand.css on the page and [data-theme="dark"] on an ancestor reach inside.
//
// The host carries data-ds="<name>", so a page with the brand's scoped base gives it the body's type, as a Vue
// component's root gets it. By default the host is display: contents and the shadow's root element is the box; an
// element whose root takes classes from the page (layout, width) styles :host instead (see PORTING.md).

declare const __DS_PREFIX__: string
/** The brand's tag prefix (brand.json elementPrefix), set at build time. */
export const PREFIX: string = typeof __DS_PREFIX__ === 'string' ? __DS_PREFIX__ : 'ds'
/** `<prefix>-<name>`. */
export const tagName = (name: string) => `${PREFIX}-${name}`
/** A tag for lit/static-html templates: html`<${tag('menu-item')}>...</${tag('menu-item')}>`. */
export const tag = (name: string): StaticValue => unsafeStatic(tagName(name))
export { literal }

// Tailwind registers its own custom properties (--tw-translate-x...) with @property, which a shadow root ignores; they
// are registered once on the document instead, so transforms and rings resolve inside every element.
let registered = false
function registerProperties() {
	if (registered || !('CSS' in globalThis) || !CSS.registerProperty) return
	registered = true
	for (const p of properties) {
		try {
			CSS.registerProperty(p)
		} catch {
			// Already registered (the page's own Tailwind, or another copy of the library).
		}
	}
}

export class DsElement extends LitElement {
	/** The registry name of this element's component (button, pixel-button), written to the host's data-ds. */
	static dsName = ''
	static styles: CSSResultGroup = [base]

	constructor() {
		super()
		registerProperties()
	}

	// ----- Lists and objects -----
	// A list or an object (`type: Array` or `Object`) can arrive as a string: a JSON attribute that does not parse, or a
	// framework that sets attributes as properties (Svelte: `options='[...]'` reaches `options` as text), or none when a
	// server render drops a bound list. The attribute parses as JSON and otherwise keeps what the property held (its
	// default at first); a string property is parsed before each render, and kept as it was when it does not parse.
	static createProperty(name: PropertyKey, options?: PropertyDeclaration) {
		if (options && (options.type === Array || options.type === Object) && !options.converter) options = { ...options, converter: { fromAttribute: parseJson, toAttribute: (v: unknown) => JSON.stringify(v) } }
		super.createProperty(name, options)
	}
	#lastGood = new Map<PropertyKey, unknown>()
	#listKeys(): PropertyKey[] {
		return [...(this.constructor as typeof LitElement).elementProperties].filter(([, o]) => o.type === Array || o.type === Object).map(([k]) => k)
	}
	attributeChangedCallback(name: string, old: string | null, value: string | null) {
		// What a list held before its attribute changed: the default, or the last list that parsed.
		const key = (this.constructor as typeof LitElement).elementProperties
		for (const [k, o] of key) if ((o.attribute === name || (o.attribute !== false && typeof o.attribute !== 'string' && String(k).toLowerCase() === name)) && (o.type === Array || o.type === Object)) {
			const now = (this as unknown as Record<PropertyKey, unknown>)[k]
			if (typeof now !== 'string') this.#lastGood.set(k, now)
		}
		super.attributeChangedCallback(name, old, value)
	}
	protected shouldUpdate(changed: PropertyValues) {
		const self = this as unknown as Record<PropertyKey, unknown>
		for (const k of this.#listKeys()) {
			const v = self[k]
			if (typeof v !== 'string') {
				this.#lastGood.set(k, v)
				continue
			}
			const parsed = parseJson(v)
			self[k] = typeof parsed === 'string' ? this.#lastGood.get(k) : parsed
		}
		return super.shouldUpdate(changed)
	}

	connectedCallback() {
		super.connectedCallback()
		const name = (this.constructor as typeof DsElement).dsName
		if (name && !this.hasAttribute('data-ds')) this.setAttribute('data-ds', name)
	}

	/** Dispatches a composed, bubbling event: `emit('confirm')`, `emit('select', { value })`. */
	emit<T>(type: string, detail?: T, options: { cancelable?: boolean } = {}) {
		return this.dispatchEvent(new CustomEvent<T>(type, { detail, bubbles: true, composed: true, cancelable: options.cancelable }))
	}

	/** v-model: sets `value` and dispatches `input` and `change`, as a native field does. */
	commit(value: unknown, key = 'value') {
		;(this as unknown as Record<string, unknown>)[key] = value
		// A value or a checked state is what a form control changes: the native input and change events, as an <input>.
		if (key === 'value' || key === 'checked') {
			this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
			this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
		}
		if (key !== 'value') this.emit(`${key}-change`, { value })
	}

	/** Whether a slot has content (Vue's `$slots.name`). Call from render; slotchange re-renders. */
	hasSlot(name = '') {
		return [...this.childNodes].some((n) => (name ? n instanceof Element && n.getAttribute('slot') === name : (n instanceof Element && !n.hasAttribute('slot')) || (n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim())))
	}

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		// Slots that come and go change what the element draws ($slots), so it renders again when they do.
		this.renderRoot.addEventListener('slotchange', () => this.requestUpdate())
	}
}

/** JSON, or the text itself when it is not JSON (the element keeps its list then). */
function parseJson(v: string | null): unknown {
	if (v === null) return v
	try {
		return JSON.parse(v)
	} catch {
		return v
	}
}

/** Defines `<prefix>-<name>` once (a second copy of a module on the page is harmless). */
export function define(name: string, element: CustomElementConstructor & { dsName?: string }) {
	// Its own name, also for a subclass (<conare-select> extends <conare-combobox>).
	if (!Object.prototype.hasOwnProperty.call(element, 'dsName') || !element.dsName) element.dsName = name
	const t = tagName(name)
	if (!customElements.get(t)) customElements.define(t, element)
}

/**
 * A form-associated element (ElementInternals): it takes part in its <form> (value, reset, disabled from a fieldset)
 * and a <label for> names it. Subclasses call `this.internals.setFormValue(...)` when their value changes.
 */
export class DsFormElement extends DsElement {
	static formAssociated = true
	readonly internals: ElementInternals
	constructor() {
		super()
		this.internals = this.attachInternals()
	}
	get form() {
		return this.internals.form
	}
	/** A disabled fieldset around it; its own `disabled` stays as it was set. Read from the page at each render (the
	 * browser's callback can land while the element is mid-update, and a state set then would be one render late). */
	get formDisabled() {
		return !!this.closest('fieldset[disabled]')
	}
	formDisabledCallback() {
		this.requestUpdate()
	}
	/** Disabled by itself or by its fieldset: what render and handlers read. A `disabled` that is not a boolean (the
	 * date picker's days that can't be picked) does not disable the element. */
	get inactive() {
		const own = (this as unknown as { disabled?: unknown }).disabled
		return (typeof own === 'boolean' && own) || this.formDisabled
	}

	// ----- Validity -----
	// A field is valid when its inner control is: after every render the element copies the control's validity onto
	// itself (ElementInternals), so its form blocks on `required` and the like, :invalid matches the host, and the
	// browser's message shows at the control, which takes focus. Fields with a native control return it from
	// validityControl(); fields without one (a switch, a listbox trigger, the date picker) override syncValidity() and
	// use setMissing().

	/** The native control whose validity this field reports, if it has one. */
	protected validityControl(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
		return null
	}
	/** Copies the control's validity onto the element. The base calls it after every render; call it again after
	 * changing the control outside a render. */
	syncValidity() {
		const c = this.validityControl()
		if (!c) return
		if (c.validity.valid) this.internals.setValidity({})
		else this.internals.setValidity(flagsOf(c.validity), c.validationMessage, c)
	}
	/** Valid, or missing a required value with the browser's own message for that `kind` of control, shown at `anchor`. */
	protected setMissing(missing: boolean, kind: 'input' | 'checkbox' | 'select' | 'radio', anchor?: HTMLElement | null) {
		if (missing) this.internals.setValidity({ valueMissing: true }, missingMessage(kind), anchor ?? undefined)
		else this.internals.setValidity({})
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// The form names a field by its `name` attribute; React 19 and Vue set `name` as a property, which leaves the
		// attribute unset and the value out of the submission. The attribute follows the property.
		if (changed.has('name' as never)) {
			const name = (this as unknown as { name?: unknown }).name
			if (typeof name === 'string' && name) {
				if (this.getAttribute('name') !== name) this.setAttribute('name', name)
			} else if (this.hasAttribute('name')) this.removeAttribute('name')
		}
		this.syncValidity()
	}
	get validity() {
		return this.internals.validity
	}
	get validationMessage() {
		return this.internals.validationMessage
	}
	get willValidate() {
		return this.internals.willValidate
	}
	checkValidity() {
		this.syncValidity()
		return this.internals.checkValidity()
	}
	reportValidity() {
		this.syncValidity()
		return this.internals.reportValidity()
	}
}

const FLAGS = ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooLong', 'tooShort', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput', 'customError'] as const
/** A ValidityState as the plain flags setValidity takes. */
export const flagsOf = (v: ValidityState): ValidityStateFlags => Object.fromEntries(FLAGS.map((f) => [f, v[f]]))

// The browser's own "fill out this field" message, in the page's language, from a detached required control.
const messages = new Map<string, string>()
export function missingMessage(kind: 'input' | 'checkbox' | 'select' | 'radio') {
	let m = messages.get(kind)
	if (m === undefined) {
		let probe: HTMLInputElement | HTMLSelectElement
		if (kind === 'select') {
			probe = document.createElement('select')
			probe.append(new Option('', ''))
		} else {
			probe = document.createElement('input')
			if (kind !== 'input') probe.type = kind
		}
		probe.required = true
		m = probe.validationMessage
		messages.set(kind, m)
	}
	return m
}

/** Light-DOM id for a part, unique per page (Vue's useId). */
let ids = 0
export const uid = (prefix: string) => `${prefix}-${PREFIX}${++ids}`

// Layout classes on a host that is display: contents (a button's margin, width or flex) apply to nothing, as the host
// draws no box. A Vue component's class lands on its root, so the element copies the host's layout onto the box it
// draws: what the host's classes compute (margins, sizes, flex and grid placement) goes on the box's inline style,
// again when its classes change and when the window resizes (responsive classes).
const LAYOUT = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'flex-grow', 'flex-shrink', 'flex-basis', 'align-self', 'justify-self', 'order', 'grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end']
const INITIAL: Record<string, string> = { 'margin-top': '0px', 'margin-right': '0px', 'margin-bottom': '0px', 'margin-left': '0px', width: 'auto', 'min-width': 'auto', 'max-width': 'none', height: 'auto', 'min-height': 'auto', 'max-height': 'none', 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'align-self': 'auto', 'justify-self': 'auto', order: '0', 'grid-column-start': 'auto', 'grid-column-end': 'auto', 'grid-row-start': 'auto', 'grid-row-end': 'auto' }

export class HostLayoutController implements ReactiveController {
	private seen?: MutationObserver
	private set = new Set<string>()
	constructor(private host: ReactiveControllerHost & HTMLElement, private box: () => HTMLElement | null) {
		host.addController(this)
	}
	private apply = () => {
		const box = this.box()
		if (!box) return
		const cs = getComputedStyle(this.host)
		if (cs.display !== 'contents') return
		for (const p of LAYOUT) {
			const v = cs.getPropertyValue(p)
			// A min size of 0px is auto on a box with no flex or grid parent: neither says anything.
			if (v && v !== INITIAL[p] && !((p === 'min-width' || p === 'min-height') && v === '0px')) {
				box.style.setProperty(p, v)
				this.set.add(p)
			} else if (this.set.has(p)) {
				box.style.removeProperty(p)
				this.set.delete(p)
			}
		}
	}
	hostConnected() {
		this.seen = new MutationObserver(this.apply)
		this.seen.observe(this.host, { attributes: true, attributeFilter: ['class', 'style'] })
		window.addEventListener('resize', this.apply)
	}
	hostDisconnected() {
		this.seen?.disconnect()
		window.removeEventListener('resize', this.apply)
	}
	hostUpdated() {
		this.apply()
	}
}
