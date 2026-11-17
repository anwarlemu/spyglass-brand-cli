---
name: legal-page
title: Legal page
type: registry:block
group: pages
description: "A legal page template (terms, privacy), built only from library items: the title and the date it changed, a list of the sections that stays in view, and the sections in a 720px column."
use_for: "Terms of service, privacy, cookies. The text is a placeholder: put the terms your counsel approves in lib/pages/legal.ts or pass `content`."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "Shipping the placeholder text"
source: "Built from the library (site header, footer row) and the brand's type; the section names are the usual ones of a terms page"
files:
  - react/components/pages/LegalPage.tsx
  - lib/pages/legal.ts
examples:
  - "Page | Legal page | bleed"
---
