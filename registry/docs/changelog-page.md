---
name: changelog-page
title: Changelog page
type: registry:block
group: pages
description: "The changelog template, built only from library items: every release newest first under a hairline, its date in capitals on the left, the change as a Funnel Display sentence, its details and a picture when there is one."
use_for: "A website's changelog. The entries are examples drawn from what the assets say the product does, and their dates are placeholders: replace them in lib/pages/changelog.ts."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "A release date that is not real"
source: "Built from the library (site header, creative card, footer row); the entries' sentences are the posts' own lines"
files:
  - react/components/pages/ChangelogPage.tsx
  - lib/pages/changelog.ts
examples:
  - "Page | Changelog page | bleed"
---
`sections` lists the sections to show, in order (`head`, `entries`); a key left out is not shown. Each entry's `image`
is a creative (an image slot, or the placeholder's `brand` and `tone`). `menus` passes the header menus (the live
card's `picture`, the use cases' `shots`).
