---
name: resources-page
title: Resources page
type: registry:block
group: pages
description: "The site's resources page: the header, the page head with its ASCII drift, the hub's linked cards (templates, docs with code, case studies) in two columns, the hairline rows of what is coming, the closing section and the footer."
use_for: "A resources or learn index that links to templates, docs, case studies and writing; `content` replaces the copy."
never:
  - "Another brand's creatives in the covers: pass your own images as `src` or keep the Acme placeholders"
  - "Real customers or people in the copy: Acme only"
  - "A second White button in the hub: the cards are links on the surface"
source: "Site app/resources/page.tsx and pages/Resources (ResourceHub.tsx, Resources.module.css): PageHead, the hub in the container with the section padding under it, PageClose and the footer"
files:
  - react/components/pages/ResourcesPage.tsx
  - lib/pages/resources.ts
  - lib/pages/site-chrome.ts
examples:
  - "Page | Resources page | bleed"
---
`sections` lists the sections to show, in order (`head`, `cards`, `close`); a key left out is not shown. The covers'
creatives are image slots (or the placeholder's `brand` and `tone`). `menus` passes the header menus (the live card's
`picture`, the use cases' `shots`).
