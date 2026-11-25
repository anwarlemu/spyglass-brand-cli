---
name: dashboard-page
title: Dashboard page
type: registry:block
group: pages
description: "A product dashboard: a side rail, the title and one White button, four figures on cards and the latest rows in a hairline table."
use_for: "The overview screen of the product; data comes through `content`."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a view"
  - "Real people or customers in the copy: Acme only"
source: "Built from the library and the site's surfaces (cards on --surface, the rail on --raised, hairlines, the 36px links of the header)"
files:
  - react/components/pages/DashboardPage.tsx
  - lib/pages/dashboard.ts
examples:
  - "Page | Dashboard | bleed"
---
`sections` lists the sections to show, in order (`head`, `stats`, `table`); a key left out is not shown.
