---
name: not-found-page
title: 404 page
type: registry:block
group: pages
description: "The site's 404 page: the header, the page head with the title, what happened in a plain sentence, the White way home and the quiet way to the docs, the ASCII drift in the right columns, and the footer."
use_for: "A website's not-found page. Edit lib/pages/not-found.ts or pass `content`."
never:
  - "A joke or an error code as the title"
  - "More than one White button in a view"
  - "A search or other controls in the head: two ways on, home and the docs"
source: "Site app/not-found.tsx and content/pages/errors.ts: Header, PageHead (margin, the cluster drift) with the homepage and the docs, Footer; as main's last section the head keeps --section-y under it (56, 76 at 768, 84 at 1024)"
files:
  - react/components/pages/NotFoundPage.tsx
  - lib/pages/not-found.ts
examples:
  - "Page | 404 page | bleed"
---
`sections` lists the sections to show, in order (`head`); a key left out is not shown. `menus` passes the header menus
(the live card's `picture`, the use cases' `shots`).
