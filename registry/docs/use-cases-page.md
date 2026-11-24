---
name: use-cases-page
title: Use cases page
type: registry:block
group: pages
description: "The site's use-cases hub: the header, the page head with the ASCII drift, the use cases as linked cards three across (each with three creatives on its Black cover), the closing section with the connect menu, and the footer."
use_for: "An index of use cases, solutions or audiences, each card linking to its own page. `content` replaces the copy and the cards (lib/pages/use-cases.ts)."
never:
  - "Another brand's creative on a card: pass your own images as `src` or keep the Acme placeholders"
  - "Cards that move on hover"
  - "A second White button in the head: the hub has none"
source: "Site app/use-cases/page.tsx and pages/UseCasesPage (UseCaseHub.tsx, UseCaseHub.module.css over Resources.module.css): PageHead with the title and lead, the cards in .container three across from 1024 with the 240px cover, the section padding under them, PageClose, the footer"
files:
  - react/components/pages/UseCasesPage.tsx
  - lib/pages/use-cases.ts
examples:
  - "Page | Use cases page | bleed"
---
Each card takes `title`, `line`, `meta` (who it is for), `href` and a `cover` of three creatives. The header and footer
read lib/pages/site-chrome.ts.
