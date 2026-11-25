---
name: blog-page
title: Blog page
type: registry:block
group: pages
description: "The blog index template, built only from library items: the title, the newest post large and every other post in a grid of three, each with an image, the date and category in capitals and a Funnel Display title."
use_for: "A website's blog index. The posts are neutral examples: replace them in lib/pages/blog.ts or pass `content`."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "Another brand's photo as a post image"
source: "Built from the library (site header, creative card, button, footer row) and the brand's type: Funnel Display titles, DM Sans excerpts, labels in capitals"
files:
  - react/components/pages/BlogPage.tsx
  - lib/pages/blog.ts
examples:
  - "Page | Blog page | bleed"
---
`sections` lists the sections to show, in order (`head`, `featured`, `posts`); a key left out is not shown. Each
post's `image` is a creative: an image slot, or the placeholder's `brand`, `caption` and `tone`. `menus` passes the
header menus (the live card's `picture`, the use cases' `shots`).
