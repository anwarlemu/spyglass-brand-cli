---
name: product-cards
title: Product cards
type: registry:ui
group: site
description: "The site's product cards: products in a grid ruled apart by hairlines, each a link with the name in Funnel Display, one line on what it does and the endpoint in the code face; the #262626 fill under a mouse."
use_for: "Related products under a product page, or every product on an index, three or four across."
never:
  - "Pictures or icons in the cards"
  - "Cards that grow or move on hover: the fill changes, nothing moves"
  - "Uneven columns: three or four"
source: "Site pages/Products/ProductCards (Products.module.css .cards, .card, .cardEndpoint): gap --hairline on --line, cards on --bg 24px in (0 at the sides under 768), .t-sub names, .text lines (body 16/24 --text-2), the endpoint in --font-mono small --text-3 at the foot; --surface on hover (fine pointers) and on press, --dur-fast"
files:
  - react/components/site/ProductCards.tsx
examples:
  - "Related | Three related products | bleed"
---
