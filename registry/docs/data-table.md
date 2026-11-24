---
name: data-table
title: Data table
type: registry:ui
group: ui
description: "A table people filter, sort and page through: a dropdown per filter, heads in capitals that sort, 40px rows on neutral hairlines that take the #262626 fill under the pointer, numbers in tabular figures, Previous and Next under it. It scrolls sideways with fading edges inside the frame."
use_for: "A board's creatives, a brand's ads, a team's searches: rows of one kind of thing that people narrow and order."
never:
  - "Zebra stripes or a shadow: hairlines separate rows"
  - "Bold heads: DM Sans Medium capitals at 6%"
  - "A spectrum color for a sorted column or a picked filter"
  - "A table wider than the page without its own scroll"
source: "Derived from the guidelines: DM Sans for cells and capital labels for heads, neutral hairlines, the #262626 card fill for the hovered row and the filter menus, the 10px canvas corner (8px here). shadcn's data table (filters, sortable heads, pagination) for anatomy and ARIA."
files:
  - react/components/ui/DataTable.tsx
examples:
  - "Creatives | A board's creatives"
---
