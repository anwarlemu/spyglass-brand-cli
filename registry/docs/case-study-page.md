---
name: case-study-page
title: Case study page
type: registry:block
group: pages
description: "The site's case study: a centered head (breadcrumb, headline, kind and read time), the facts with the products it uses, the lead picture, the opening line over three figures, a pull quote, the sections with a second quote, and the pager to the other studies, with ASCII crops in the margins from 1024."
use_for: "A customer story or case study page; `study` takes the story (lib/pages/case-studies.ts shows the fields), `content.studies` the list the pager walks."
never:
  - "Real customers, people, quotes or logos unless you may show them: the examples are Acme"
  - "Another brand's photo as the lead picture without permission: the placeholder stands in"
  - "Figures that are not true for the story: they read as facts"
source: "Site app/resources/case-studies/[slug]/page.tsx and pages/CaseStudies (CaseStudyArticle.tsx, CaseStudyPage.module.css): head 80/48px (160/64 from 1024), 24px gaps (32 from 1024), the title at most 880px; the 640px measure; facts 2 then 4 columns, 24/20 gaps, 48px under (64 from 768), underlined links in --line-strong; the cover 16:9 (4:5 under 768) with --radius-m; the lead .t-lead 64px down, figures 48px further over a hairline, h4 values; body 64/96px, the pull quote 32px in on --surface, sections 96px apart with h4 titles (h2 from 1024), paragraphs 24px apart in --text-2, the aside 40px down with a --line-strong rule; the pager 40px tall padding between hairlines; drifts from 1024 beside each band"
files:
  - react/components/pages/CaseStudyPage.tsx
  - lib/pages/case-studies.ts
examples:
  - "Page | Case study | bleed"
---
`sections` lists the sections to show, in order (`head`, `facts`, `cover`, `lead`, `body`, `more`, `close`); a key
left out is not shown. All but the close stay inside the article, where the first of them falls. The study's `cover`
is an image slot; without `src` the placeholder carries `data-ds-placeholder`. `menus` passes the header menus (the
live card's `picture`, the use cases' `shots`).
