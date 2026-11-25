// The home pricing panels' copy and placeholder creatives (site content/v2/closing pricingV2). The lines are the
// site's own; the creatives are Acme placeholders (pass your own images through `sets`). Both flavors read this file.

import type { ImageSlot } from '@/lib/image'

export interface PricingPanelsContent {
	/** The headline, one line each. */
	lines: string[]
	/** The terms under it; each sentence keeps to one line on phones. */
	note: string
	primary: { label: string; href: string }
	secondary: { label: string; href: string }
}

/** One creative in a set: an image, or an Acme placeholder (advertiser and a neutral tone, 1 to 4). */
export interface PanelCreative extends ImageSlot {
	brand?: string
	tone?: 1 | 2 | 3 | 4
}

export const pricingPanelsContent: PricingPanelsContent = {
	lines: ['Start free.', 'Pay for what you use'],
	note: '500 free credits every month. No card required.',
	primary: { label: 'Get a free API key', href: '/sign-up' },
	secondary: { label: 'See full pricing', href: '/pricing' },
}

const BRANDS = ['Acme Fit', 'Acme Drinks', 'Acme Skin', 'Acme Studio', 'Acme Goods']
const TONES = [3, 2, 4, 1, 3, 4, 1, 2, 3, 2] as const

/** Five sets of five placeholders: each set takes its turn in the run. */
export const pricingPanelSets: PanelCreative[][] = [0, 1, 2, 3, 4].map((s) => [0, 1, 2, 3, 4].map((slot) => ({ brand: BRANDS[(s + slot) % BRANDS.length], tone: TONES[(s * 2 + slot) % TONES.length] })))

/** The order the slots arrive in (site STAGGER_RANK): the middle first, the front second. */
export const PANEL_RANK = [2, 0, 4, 1, 3]

/** Splits a note into sentences (site ui/Sentences). */
export const sentences = (text: string) => text.split(/(?<=[.!?])\s+/)
