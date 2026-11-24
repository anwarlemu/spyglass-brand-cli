// The stories block's data and Acme placeholders (site v3/V3Stories, content/v3/stories.ts), read by both flavors.
// A story is a quote with the person under it; a company's mark is drawn in the soft gray through a mask, so any
// single-color file works. The placeholders are Acme's, with no photo: the avatar shows the initials.

/** A company's mark: a single-color file drawn through a mask. */
export interface StoryMark {
  src: string
  /** Width over height. */
  ratio: number
  /** Height in px: 16, 20, 24 or 32. */
  height: number
}

export interface Story {
  company: string
  /** The company's mark; without one the company is set as text. */
  logo?: StoryMark
  quote: string
  name: string
  role: string
  /** The person's photo, cropped round; without one, their initials. */
  photo?: string
}

/** A customer's mark in the row under the stories; without `src` the name is set as a wordmark. */
export interface StoryCustomer {
  name: string
  src?: string
  ratio?: number
  height?: number
}

export const storiesContent = {
  headline: 'Marketing teams on Spyglass',
  lead: 'Marketers, founders and agencies on how they research creative now.',
  customersLabel: 'Spyglass customers',
  stories: [
    { company: 'Acme', quote: 'Creators, competitor tracking and trend research, all in one place. It changed how our team plans every launch.', name: 'Sam', role: 'Performance marketer' },
    { company: 'Acme Labs', quote: 'The first platform that really cracks creative research. We brief from what is working, not from what we remember.', name: 'Jo', role: 'Head of growth' },
    { company: 'Acme Studio', quote: 'Sharp, quick and built by a team that ships fixes the same day. The easiest tool to recommend to any operator.', name: 'Ari', role: 'Founder' },
    { company: 'Acme Goods', quote: 'It shows me what our audience actually sees. Finding trends and new audiences has never been easier.', name: 'Kit', role: 'General manager' },
    { company: 'Acme Air', quote: 'Agencies cannot afford blind spots. This gives us full competitive visibility across every account we run.', name: 'Rae', role: 'Operations lead' },
    { company: 'Acme & Co', quote: 'We built the brand around our customers. This is the one place that shows every creative they engage with.', name: 'Lou', role: 'Co-founder' },
  ] as Story[],
  customers: [{ name: 'Acme' }, { name: 'Acme Labs' }, { name: 'Acme Studio' }, { name: 'Acme Goods' }, { name: 'Acme Air' }, { name: 'Acme & Co' }] as StoryCustomer[],
}

/** The first letters of the first two words (the avatar without a photo). */
export const storyInitials = (name: string) => name.split(' ').map((part) => part[0] ?? '').join('').slice(0, 2)

// The grid's rules a class cannot say: from 1024 the cards share rows through a subgrid (company, quote, person line
// up across a row); three cards or fewer take one row; two cards sit in the middle eight of twelve columns.
export const storiesCss = `
@media (min-width: 1024px) {
  .ds-stories { grid-template-rows: repeat(2, auto 1fr auto); }
  .ds-stories:not(:has(> :nth-child(4))) { grid-template-rows: auto 1fr auto; }
  .ds-stories:has(> :nth-child(2):last-child) { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .ds-stories:has(> :nth-child(2):last-child) > :first-child { grid-column: 3 / span 4; }
  .ds-stories:has(> :nth-child(2):last-child) > :last-child { grid-column: 7 / span 4; }
}
`
