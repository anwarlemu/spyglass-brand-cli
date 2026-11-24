// The site's code display (sections/Connect Code, CopyButton): source split into runs, with comments, punctuation and
// string quotes in the muted gray and everything else White; and a copy that falls back to a hidden textarea. Both
// flavors read it.
export interface CodeRun { text: string; dim?: boolean }

const TOKEN = /(#.*$)|("(?:[^"\\]|\\.)*")|(https?:\/\/[^\s"']+)|([{}[\]():,=\\.'])/gm

/** The runs of `source`; JSON keeps `#` as text. */
export function codeRuns(source: string, language = 'shell'): CodeRun[] {
	const out: CodeRun[] = []
	let last = 0
	for (const match of source.matchAll(TOKEN)) {
		const [text, comment, string, url, mark] = match
		const at = match.index ?? 0
		if (comment && language === 'json') continue
		if (at > last) out.push({ text: source.slice(last, at) })
		if (comment || mark) out.push({ text, dim: true })
		else if (url) out.push({ text })
		else if (string) out.push({ text: '"', dim: true }, { text: string.slice(1, -1) }, { text: '"', dim: true })
		last = at + text.length
	}
	if (last < source.length) out.push({ text: source.slice(last) })
	return out
}

/** Puts `text` on the clipboard; true when it worked. */
export async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text)
		return true
	} catch {}
	const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
	const area = document.createElement('textarea')
	area.value = text
	area.setAttribute('readonly', '')
	area.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
	document.body.append(area)
	area.focus({ preventScroll: true })
	area.select()
	let ok = false
	try {
		ok = document.execCommand('copy')
	} catch {}
	area.remove()
	previous?.focus({ preventScroll: true })
	return ok
}

export interface CodeTab { id: string; label: string; code: string; language?: string }

export const codeTabsExample: CodeTab[] = [
	{ id: 'curl', label: 'cURL', language: 'shell', code: '# Search the ads of a brand\ncurl "https://api.acme.com/v1/search" \\\n  -H "Authorization: Bearer $ACME_KEY" \\\n  -d \'{"query": "skincare launches", "limit": 20}\'' },
	{ id: 'ts', label: 'TypeScript', language: 'ts', code: 'const res = await fetch("https://api.acme.com/v1/search", {\n  method: "POST",\n  headers: { Authorization: `Bearer ${key}` },\n  body: JSON.stringify({ query: "skincare launches", limit: 20 }),\n})' },
	{ id: 'py', label: 'Python', language: 'python', code: 'import requests\n\nres = requests.post(\n  "https://api.acme.com/v1/search",\n  headers={"Authorization": f"Bearer {key}"},\n  json={"query": "skincare launches", "limit": 20},\n)' },
]
