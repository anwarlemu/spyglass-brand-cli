---
name: legal-page
title: Legal page
type: registry:block
group: pages
description: "The site's legal pages (terms, privacy): the header, the page head with the title, the lead and the ASCII drift, then the text in the head's columns (the sections at the 640px measure on the left, their list staying in view on the right) and the footer."
use_for: "Terms of service, privacy, cookies. `page` picks the terms or the privacy copy; the text is a placeholder: put what your counsel approves in lib/pages/legal.ts or pass `content`."
never:
  - "Shipping the placeholder text"
  - "Text set in gray or under 16px: the sections read in White at 16/24"
  - "A display-size title: the page head's section head"
source: "Site app/terms and app/privacy (Header, PageHead with the title and the lead, Footer); the text in the site's type: .t-sub subheads (h6, h5 from 768), 16/24 paragraphs in --text at --measure, the page head's 7fr and 5fr columns; --section-y under it"
files:
  - react/components/pages/LegalPage.tsx
  - lib/pages/legal.ts
examples:
  - "Page | Terms | bleed"
  - "Privacy | Privacy policy | bleed"
---
