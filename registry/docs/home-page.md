---
name: home-page
title: Home page
type: registry:block
group: pages
description: "The home page template, built only from library items: the search on a band of the light, the index as a corridor, what it does, the numbers, agents around the lockup, one customer and the offer."
use_for: "A website's home. Add it, then edit the copy in lib/pages/home.ts or pass `content`; the sections are library items you can reorder or drop."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "Invented numbers in the stat block"
source: "Built from the library (site header, hero block, search bar, creative grid, creative corridor, card, stat block, creative ring, testimonial, offer block, footer row); the story follows the social ads; the copy is the assets' own lines (Ad, The only creative search engine; Ad, The world's largest creative search engine; Posts) and Acme placeholders"
files:
  - react/components/pages/HomePage.tsx
  - lib/pages/home.ts
examples:
  - "Page | Home | bleed"
---
