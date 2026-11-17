---
name: blog-post-page
title: Blog post page
type: registry:block
group: pages
description: "A blog post template, built only from library items: the way back, the title in Funnel Display, a wide image, the body in a 720px column (paragraphs, subheads, a list, a quote, a figure of creatives), more posts and the offer."
use_for: "One post of a website's blog. The body is a list of blocks in lib/pages/blog-post.ts; pass `content` for each post."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "A body wider than 720px"
source: "Built from the library (site header, creative card, creative grid, offer block, footer row) and the brand's type"
files:
  - react/components/pages/BlogPostPage.tsx
  - lib/pages/blog-post.ts
examples:
  - "Page | Blog post page | bleed"
---
