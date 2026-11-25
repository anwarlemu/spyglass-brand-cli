---
name: resource-list-page
title: Resource list page
type: registry:block
group: pages
description: "The site's list of posts or guides: the header, the page head with the list's title and line, the entries newest first as hairline rows (date, title, line; with a `thumb`, a 16:9 picture on the left and the three lines stacked beside it), or a quiet panel with the empty note and the way back to all resources, then the closing section and the footer."
use_for: "A blog, articles or guides index; `list` takes the entries (an empty list shows the empty panel), `content` the rest of the copy."
never:
  - "Cards in the rows: the list is hairline rows, with at most a small 16:9 thumbnail on the left"
  - "Dates in a local time zone: they read in UTC so every reader sees the same day"
  - "Real authors or customers in the copy: Acme only"
source: "Site app/resources/[slug]/page.tsx and pages/Resources (ResourceList.tsx, Resources.module.css .list, .row, .date, .rowTitle, .empty): rows 24px tall padding with a hairline under each, the date 14/20 in --text-3 in a 160px column 32px from the title from 768, the title 20/28, the line in --text-2; .rowThumb and .thumb: a 96px picture column 20px from the text (160 and 32 from 768), the picture 16:9 with --radius-s across the three lines; the back button full width below 768 (globals.css main a.btn); the empty panel --raised with --radius-m, at least 320px tall, 32px in, the note 20/28 and the quiet button 24px under it"
files:
  - react/components/pages/ResourceListPage.tsx
examples:
  - "Empty | No posts yet | bleed"
  - "Articles | With entries and thumbnails | bleed"
---
