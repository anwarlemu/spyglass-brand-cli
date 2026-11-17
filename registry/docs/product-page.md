---
name: product-page
title: Product page
type: registry:block
group: pages
description: "The product page template, built only from library items: the deck cover's hero, one section per thing the product does (search, the brief, the category, adding a brand, agents), copy and picture side by side, and the offer."
use_for: "A website's product tour. Each section is a library item beside a headline from the assets; reorder or drop them."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "A section without a picture from the library"
source: "Built from the library (site header, hero block, creative row, search bar, creative grid, card, stat block, creative ring, offer block, footer row); Figma page 8: Pitch deck cover, Curved strip; the headlines are the posts' and ads' own"
files:
  - react/components/pages/ProductPage.tsx
  - lib/pages/product.ts
examples:
  - "Page | Product page | bleed"
---
