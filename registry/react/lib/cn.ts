// Joins class names, skipping falsy ones: cn('a', on && 'b', ['c', undefined]). It does not merge conflicting
// utilities (no tailwind-merge), as Vue's class binding does not: the library's classes are written not to compete,
// and a className from the caller is appended after them, as Vue appends a fallthrough class.
export type ClassValue = string | false | null | undefined | 0 | ClassValue[]

export function cn(...values: ClassValue[]): string {
	const out: string[] = []
	for (const v of values) {
		if (!v) continue
		if (Array.isArray(v)) {
			const s = cn(...v)
			if (s) out.push(s)
		}
		else out.push(v)
	}
	return out.join(' ')
}
