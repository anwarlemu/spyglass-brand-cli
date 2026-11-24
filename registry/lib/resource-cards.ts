// The resource cards' data and the code cover's tokens, shared by both flavors (the site's ResourceHub and
// sections/Connect/Code: comments, quotes and punctuation in the muted gray, the rest White).

/** A creative in a card's cover: the user's image as `src`, or an Acme placeholder (advertiser and tone). */
export interface ResourceCreative {
	src?: string
	alt?: string
	brand?: string
	caption?: string
	tone?: 1 | 2 | 3 | 4
}

/** A card's cover: a row of creatives, or a few lines of code. */
export type ResourceCover = { kind: 'creatives'; items: ResourceCreative[] } | { kind: 'code'; source: string; language?: string }

export interface ResourceCard {
	title: string
	line: string
	href: string
	/** The small gray line at the foot ("4 templates", "docs.acme.com"). */
	meta?: string
	cover?: ResourceCover
}

/** A row under the cards: a resource that is not ready, or a plain link. */
export interface ResourceRow {
	title: string
	line: string
	/** Leave it out for a row that is not live (it is not a link). */
	href?: string
	/** The badge on the right ("Coming soon"). */
	badge?: string
}

/** A link to another site opens in a new tab. */
export const isExternal = (href: string) => /^https?:\/\//.test(href)

export interface CodeToken {
	text: string
	dim: boolean
}

const TOKEN = /(#.*$)|("(?:[^"\\]|\\.)*")|(https?:\/\/[^\s"']+)|([{}[\]():,=\\.'])/gm

/** The site's code tokens: comments, quote marks and punctuation dim, strings and URLs White. */
export function codeTokens(source: string, language = 'shell'): CodeToken[] {
	const out: CodeToken[] = []
	let last = 0
	for (const match of source.matchAll(TOKEN)) {
		const [text, comment, string, url, mark] = match
		const at = match.index ?? 0
		if (comment && language === 'json') continue
		if (at > last) out.push({ text: source.slice(last, at), dim: false })
		if (comment || mark) out.push({ text, dim: true })
		else if (url) out.push({ text, dim: false })
		else if (string) out.push({ text: '"', dim: true }, { text: string.slice(1, -1), dim: false }, { text: '"', dim: true })
		last = at + text.length
	}
	if (last < source.length) out.push({ text: source.slice(last), dim: false })
	return out
}
