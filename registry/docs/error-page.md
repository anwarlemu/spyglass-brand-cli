---
name: error-page
title: 500 page
type: registry:block
group: pages
description: "The 500 page: the light from the corners, what happened in a plain sentence, try again, the way home and a line to write to the team."
use_for: "A server error page. Try again calls `onRetry` (React) or fires `retry` (web component)."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a view"
  - "Real people or customers in the copy: Acme only"
source: "Built from the library and the site's surfaces (cards on --surface, the rail on --raised, hairlines, the 36px links of the header)"
files:
  - react/components/pages/ErrorPage.tsx
  - lib/pages/error.ts
examples:
  - "Page | 500 page | bleed"
---
