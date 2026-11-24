---
name: case-stories-block
title: Case stories block
type: registry:block
group: blocks
description: "The home's case stories: a centered head, each case as a wide picture with its panel (company, headline figure, quote, person and the link to the story), the panel floating over the picture's corner from 1024 on alternating sides, then quotes in cards three across."
use_for: "Customer proof on a home or a case studies page: a few cases with a number each, and short quotes."
never:
  - "Customers' names, marks, photos or quotes you may not show: the defaults are Acme placeholders"
  - "A case without a concrete figure"
  - "The arrow moving on hover: only the link's color changes"
source: "Site v3/V3CaseStories (V3CaseStories.tsx and .module.css; content/pages/caseStudies, content/v3/stories): cards 16px apart in a 640px column, three across 24px apart from 1024; lead stories 560px tall with a 480px panel 24px in from the corner, 32px padding, the quote 24/28 (20/24 in cards), the figure 40/44; the panel and link change over 240ms on the ease-out"
files:
  - react/components/blocks/CaseStoriesBlock.tsx
  - lib/home/stories.ts
examples:
  - "Stories | Acme placeholders | bleed"
---
