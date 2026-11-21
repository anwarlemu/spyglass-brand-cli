---
name: table
title: Table
type: registry:ui
group: ui
description: "Rows of one kind of thing on Black: heads as capital labels in muted DM Sans Medium, cells in DM Sans 14px, a #262626 hairline between rows and the ghost fill under the pointer. Framed, it sits in a hairline box with the brand corner. It scrolls sideways with fading edges inside the frame."
use_for: "Boards, tracked brands, ads with a few columns to compare. Numbers right-aligned in tabular figures; a total in the footer; a caption under it."
never:
  - "A table for one record: use Item or a card"
  - "Zebra stripes, colored rows or shadows: the hairline separates"
  - "A scroll box a keyboard can't reach: give a framed table a label"
  - "Bold heads: labels are Medium in capitals with 6% tracking"
source: "Derived from the brand guidelines (no table in the brand assets): the label style for heads, DM Sans for cells, the neutral steps for hairlines, the plan card's fill for the footer"
files:
  - react/components/ui/Table.tsx
examples:
  - "Boards | Boards with a total"
  - "Tracked | Framed with actions"
---
