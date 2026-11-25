---
name: careers-page
title: Careers page
type: registry:block
group: pages
description: "The careers page: the page head with the light, why join as three cards and the open roles as rows under hairlines."
use_for: "A careers page; roles come through `content`."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a view"
  - "Real people or customers in the copy: Acme only"
source: "Built from the library and the site's surfaces (cards on --surface, the rail on --raised, hairlines, the 36px links of the header)"
files:
  - react/components/pages/CareersPage.tsx
  - lib/pages/careers.ts
examples:
  - "Page | Careers page | bleed"
---
`sections` lists the sections to show, in order (`hero`, `values`, `roles`); a key left out is not shown. `menus`
passes the header menus (the live card's `picture`, the use cases' `shots`).
