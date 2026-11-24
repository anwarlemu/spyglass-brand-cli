import { archiveMoments, drawArchive } from '@/lib/effects/abstract-archive'
import { graphMoments, makeDrawGraph, type Cluster } from '@/lib/effects/abstract-graph'
import { makeDrawTags, tagMoments, type Tag } from '@/lib/effects/abstract-tags'
import type { Draw, Moments } from '@/lib/effects/abstract'

// The three abstract canvases (abstract/Abstract): what each draws, at what frame rate, its moments and the line read
// to assistive tech. Data comes through props; the defaults are Acme's.
export type AbstractKind = 'archive' | 'tags' | 'graph'
export type { Cluster, Tag }

export const ACME_TAGS: Tag[] = [
  { label: 'Hook', value: 'Before and after' },
  { label: 'Angle', value: 'Saves time' },
  { label: 'Persona', value: 'Busy parent' },
]
export const ACME_CLUSTERS: Cluster[] = [
  { label: 'Ads', angle: -150, count: 5 },
  { label: 'Landing pages', angle: -30, count: 4 },
  { label: 'Organic posts', angle: 150, count: 5 },
  { label: 'Creators', angle: 30, count: 4 },
]

export interface AbstractSet { name: string, draw: Draw, fps: number, moments: Moments, summary: string }

export function abstractSet(kind: AbstractKind, { tags = ACME_TAGS, brand = 'Acme', clusters = ACME_CLUSTERS }: { tags?: Tag[], brand?: string, clusters?: Cluster[] } = {}): AbstractSet {
	if (kind === 'tags') {
		return {
			name: 'It is pre-analyzed',
			draw: makeDrawTags(tags),
			fps: 30,
			moments: (ms) => tagMoments(ms, tags.length),
			summary: `A field of characters resolves into tags, one at a time: ${tags.map((t) => `${t.label.toLowerCase()}, ${t.value}`).join('; ')}.`,
		}
	}
	if (kind === 'graph') {
		return {
			name: 'It is one graph',
			draw: makeDrawGraph(brand, clusters),
			fps: 60,
			moments: graphMoments,
			summary: `${brand} in the middle, linked to its ${clusters.map((c) => c.label.toLowerCase()).join(', ')}, and those records linked to each other.`,
		}
	}
	return {
		name: 'It remembers',
		draw: drawArchive,
		fps: 30,
		moments: archiveMoments,
		summary: "A brand's records as rows of characters, today at the top. New days arrive and older ones sink and pack together toward the foot, kept from a week, a month and a year ago.",
	}
}
