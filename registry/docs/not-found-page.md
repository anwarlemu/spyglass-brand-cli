---
name: not-found-page
title: 404 page
type: registry:block
group: pages
description: "The 404 page template, built only from library items: a centered hero with the light flowing in from the corners, the headline as a plain sentence, the search bar and the way home."
use_for: "A website's not-found page. The search bar's query goes to `onSearch` (React) or the `search` event (web component)."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "A joke or an error code as the headline"
source: "Built from the library (site header, hero block, search bar, button, footer row); the voice from the assets' copy"
files:
  - react/components/pages/NotFoundPage.tsx
  - lib/pages/not-found.ts
examples:
  - "Page | 404 page | bleed"
---
