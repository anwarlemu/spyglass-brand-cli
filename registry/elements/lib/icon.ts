import type { IconNode } from 'lucide'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'

// A Lucide icon as lucide-vue-next and lucide-react draw it (the same svg, attributes and classes), built from the
// icon's nodes, which esbuild inlines into the element's module: html`${icon(Trash2, 'trash-2', { size: 12 })}`.
// `strokeWidth` defaults to Lucide's 2, as in Vue; `class` adds classes and `attrs` aria-* and the like. The markup is
// the same string from one render to the next, so Lit keeps the node (CSS transitions on it keep running).
export interface IconOptions {
	size?: number
	strokeWidth?: number
	class?: string
	attrs?: Record<string, string | undefined>
}

const escape = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export function iconMarkup(node: IconNode, name: string, options: IconOptions = {}): string {
	const size = String(options.size ?? 24)
	const attrs: Record<string, string | undefined> = {
		xmlns: 'http://www.w3.org/2000/svg',
		width: size,
		height: size,
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		'stroke-width': String(options.strokeWidth ?? 2),
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round',
		class: ['lucide', `lucide-${name}`, options.class].filter(Boolean).join(' '),
		...options.attrs,
	}
	const head = Object.entries(attrs).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}="${escape(v!)}"`).join(' ')
	const children = node.map(([tag, a]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${escape(String(v))}"`).join(' ')}></${tag}>`).join('')
	return `<svg ${head}>${children}</svg>`
}

export const icon = (node: IconNode, name: string, options: IconOptions = {}) => unsafeHTML(iconMarkup(node, name, options))
