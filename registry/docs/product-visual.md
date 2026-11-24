---
name: product-visual
title: Product visual
type: registry:ui
group: site
description: "The site's product visuals: the 4:3 stage of a product page's feature row, a #262626 panel with the ASCII field around its clear middle and one small looping scene of the product, picked by `kind`: records, adding an account, comment themes, filters narrowing a search, timelines, ranked sheets, the links board and the patterns switch."
use_for: "The visual beside a feature on a product page (the site's ProductFeatures rows alternate the texture's position by row), or any section that shows what the product does in a few seconds."
never:
  - "Another brand's pictures, logos or people in the data unless you may show them: the defaults are Acme with neutral shapes"
  - "A scene that keeps moving with reduced motion: each rests on its resting step"
  - "Copy that is not the product's: the scenes show real fields and real values"
  - "Two visuals of the same kind side by side"
source: "Site pages/Products/visuals (AddAccount, AddCreator, BrandRecord, CollabsTimeline, CommentThemes, CommentThread, CreativeRecord, CreatorFilters, CreatorRecord, FilterNarrow, PageRecord, RankedSheet, TaggedRecord, TaggedTimeline, useLoopCycle), v2/V2Features (LinksBoard, PatternsSwitch, v2/motion/collaborate.ts), ProductFeatures.module.css .stage and .ascii, components/loopPacing.ts; the records use v2/V2Pricing PanelsMotion (lib/panels-motion.ts) in its reading pace"
files:
  - react/components/site/ProductVisual.tsx
  - lib/product-visual.ts
  - lib/product-visual-data.ts
  - lib/product-visual-css.ts
  - lib/product-visual-board.ts
examples:
  - "Records | Brand, creative and page records | center"
  - "People | Creator, tagged and comment records | center"
  - "Add | Adding an account and comment themes | center"
  - "Filters | Filters narrowing a search | center"
  - "Timelines | Timelines by window | center"
  - "Sheets | Ranked sheets with a switch | center"
  - "Board | Links board and patterns switch | center"
---
`kind` is one of `brand-record`, `creative-record`, `page-record`, `creator-record`, `tagged-record`,
`comment-thread`, `add-account`, `add-creator`, `comment-themes`, `creator-filters`, `filter-narrow`, `posts-narrow`,
`collabs-timeline`, `tagged-timeline`, `media-mix`, `campaigns`, `pages-switch`, `links-board` and `patterns-switch`.
`data` takes that kind's shape (`ProductVisualDataMap[kind]` in `lib/product-visual-data.ts`; its defaults are in
`productVisualDefaults`): pass `picture`, `avatar`, `logo` or `src` where you may show an image, and leave them out for
a neutral shape. `texture` picks the ASCII field's position (0 to 3; `false` in React, `"none"` in web components, for
none). The stage measures its own width, so the same visual fits a phone, a half column or a wide row.

The loops follow the site's reading pace: a scene starts once it is on screen, holds its first step for 3.8s, then
changes and holds 2.8s each time; with reduced motion it stays on its resting step. The ranked sheets and the patterns
switch are tabs (arrow keys, Home and End move between them); pressing one stops the loop on that view. The links board
holds its composed frame before it starts clearing and building scene after scene.
