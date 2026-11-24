---
name: resource-cards
title: Resource cards
type: registry:ui
group: site
description: "The site's resource hub: linked cards on the #262626 surface with a Black cover (a row of creatives or a few lines of code), the title, the line and a meta line, in two columns (or three for the use-cases hub), and hairline rows under them for what is not ready yet."
use_for: "An index of resources, use cases, templates or guides: each card links to its page. `rows` lists what is coming with a badge; `columns={3}` sets the use-cases hub."
never:
  - "Another brand's creative in a cover: pass the user's images as `src` or keep the Acme placeholders"
  - "Cards that lift, scale or move on hover: only the surface changes color"
  - "More than three columns, or a card without a link"
source: "Site pages/Resources (ResourceHub.tsx, Resources.module.css) and pages/UseCasesPage (UseCaseHub.tsx, UseCaseHub.module.css): cards 8px in on --surface with --radius-m, turning --surface-hover (160ms, ease-out); the cover 240px (320 from 1024; the use-cases hub keeps 240) 24px in on --bg with --radius-s; tiles 4:5, 12px apart, flex 0 1 --resources-tile-w 120px (use cases 80, 64 at 1024, 80 at 1280, 96 at 1440); the code in mono 14/20 with comments and marks in --text-3; text 16px in (24 on top from 768), h5 title, body line in --text-2, meta 14/20 in --text-3; 16px between cards, 48 before the rows; rows 20px tall padding (24 from 1024) with a 240px name column from 1024, the line in --text-off and the .t-badge"
files:
  - react/components/site/ResourceCards.tsx
  - lib/resource-cards.ts
examples:
  - "Hub | Resources hub | bleed"
  - "UseCases | Three columns | bleed"
---
Cards are links; a card whose `href` starts with `http` opens in a new tab. A row without `href` is plain text (a
resource that is not live). The use-cases hub passes each use case as a card: its creatives as the cover, the name as
the title, the line and who it is for as the meta.
