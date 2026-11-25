// The resource cards' data, shared by both flavors (the site's ResourceHub; the code cover is the code-block item's
// Code).
import type { ImageSlot } from '@/lib/image'

/** A creative in a card's cover: the user's image as `src`, or an Acme placeholder (advertiser and tone). */
export interface ResourceCreative extends ImageSlot {
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
