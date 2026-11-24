---
name: stories-block
title: Stories block
type: registry:block
group: blocks
description: "The site's stories section: the section head centered over quotes in #262626 cards (the company's mark or name, the quote in Funnel Display 20/24, the person with a ringed 40px avatar and the role in capitals), three columns from 1024 that line up row by row, two cards in the middle, and an optional row of customer marks over a hairline."
use_for: "Quotes from customers on the home page and on use case pages. `stories` takes { company, logo?, quote, name, role, photo? }; `customers` and `logos` show the row of marks (the use case pages hide it)."
never:
  - "A real person's quote, name or photo without their consent: Acme placeholders in templates and examples"
  - "Another company's logo shipped in the library: pass the marks you may show"
  - "Stars, ratings or a carousel"
  - "A filter or tint over a photo"
source: "Site v3/V3Stories (V3Stories.tsx and .module.css, ui/Avatar): head 64px over the cards (80 from 1024), lead 24px under the head; cards 24px padding (32 from 1024), 8px corners, --surface, gaps 16 (24 from 1024), 640px wide on phones; quote 32px under the company, person 32px over the foot; customers 64px under (80), 48px over a hairline, two columns, three from 768, a spread row from 1024"
files:
  - react/components/blocks/StoriesBlock.tsx
  - lib/stories.ts
examples:
  - "Home | Six stories with customers | bleed"
  - "Team | Three stories | bleed"
  - "Pair | Two stories | bleed"
---
