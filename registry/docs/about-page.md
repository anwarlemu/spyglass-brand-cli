---
name: about-page
title: About page
type: registry:block
group: pages
description: "The about page template, built only from library items: the deck's line centered under the light field, a row of creatives, what the company keeps to, the numbers and a way in."
use_for: "A website's about page. Edit lib/pages/about.ts or pass `content`."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "Team photos with filters or tints"
source: "Built from the library (site header, hero block, creative row, card, stat block, button, footer row); Figma page 8: the deck's line (The largest historical record of creative data.); guidelines page 36 (Brand imagery) for what the company keeps to"
files:
  - react/components/pages/AboutPage.tsx
  - lib/pages/about.ts
examples:
  - "Page | About page | bleed"
---
