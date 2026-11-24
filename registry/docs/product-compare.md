---
name: product-compare
title: Product compare
type: registry:ui
group: site
description: "The site's product comparison: the section head over a table of what the product does against two other ways of doing it, a check, a cross or a few words in each cell, the last column yours with the logomark and White checks; on phones each row is its label over its cells."
use_for: "A product page's case against the alternatives, three to six rows of things a buyer checks."
never:
  - "Naming a competitor: the columns are kinds of tools (ad libraries, scrapers)"
  - "More than three columns"
  - "Claims the product does not make good on"
source: "Site pages/Products/ProductCompare (ProductCompare.module.css): .t-head with a .t-lead 24px under it, 48px (64 at 1024) to the table; rows ruled by --line, labels body 16/24 with 20px above and below, 160px columns (88 on phones) of 20px marks in --text-3 (yes --text-2, ours --text) or words in small 14/20 (caption on phones); the last head Medium White with the logomark; a stacked table under 768"
files:
  - react/components/site/ProductCompare.tsx
examples:
  - "Creators | Creator search | bleed"
---
`rows` takes one cell per column: `"yes"`, `"no"` or a few words. `mark` (React) or the `mark` slot (web component)
replaces the logomark beside the last column's name.
