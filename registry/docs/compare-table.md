---
name: compare-table
title: Compare table
type: registry:ui
group: site
description: "The site's plan comparison: a table per group, its head (the group's title and the plans' names) sticking under the page header while the group scrolls, then a row per line with a value in #A3A3A3, a White check or nothing for each plan. Names can carry a tip and a link, lines the Soon tag; on phones one plan at a time."
use_for: "Under a pricing table, to compare plans line by line: usage, what each plan includes, access, support."
never:
  - "Colored checks or crosses: a plan without the line shows nothing"
  - "Long sentences in a cell: a value or a check"
  - "More than four plans: the cells get too narrow"
source: "Site pages/Pricing (CompareTable.tsx, CompareTable.module.css, Pricing.module.css .compare*): rows on a 2fr and 1fr grid, 24px apart, ruled by --line, 16px in; the sticky head at --header-h with the 48px fade; titles h4 to h3 at 1024; the dotted --text-3 underline and the tip on --raised after --dur-menu-intent; the phone picker is the segmented switch"
files:
  - react/components/site/CompareTable.tsx
examples:
  - "Compare | Usage and access, four plans | bleed"
---
A cell is `true` (included, read out as "Included"), `''` (not included) or a short value. `labels` changes the words
for the tag and for assistive tech. The site hides the table on phones; it still works there, one plan at a time.
