---
name: about-page
title: About page
type: registry:block
group: pages
description: "The site's about and careers page: the head centered with one White button, a strip of photos in front of the band of light drifting slowly, the story at 720px, the benefits (each group's title beside its list) and the footer."
use_for: "A company's about or careers page. Put your team's photos in `content.photos` (`src` and `alt`; `light` for one of the site's light tiles, `wide` for two columns); edit lib/pages/about.ts or pass `content`."
never:
  - "Photos with filters, tints or overlays: as taken"
  - "A light that keeps moving with reduced motion"
  - "Someone else's team in the strip: your own photos, or the empty tiles"
  - "More than one White button in a view"
source: "Site pages/About (AboutPage.tsx, About.module.css) and content/pages/about.ts: the head 128px from the top, the title h3 (h2 from 768) at --measure + 80, the lead 32px under it, the button 56px under that; the strip 96px above and below, seven 120px columns 8px apart on phones (the width, 12px apart, from 768), tiles 4:5 on --surface, the wide one two columns; public/brand/light/hero-band.webp at 120% width drifting 4% over --hero-band-bob-time (14s) on --ease-drift, and tile-b and tile-c; the story 96px below, the benefits 128px below; .t-sub heads, 16/24 text in --text, the group title h6 medium beside its list (240px) from 640"
files:
  - react/components/pages/AboutPage.tsx
  - lib/pages/about.ts
  - lib/light-tiles.ts
examples:
  - "Page | About page | bleed"
---
`sections` lists the sections to show, in order (`head`, `photos`, `story`, `perks`); a key left out is not shown.
`content.photos` take your team's photos as image slots (`src`, `alt`, `fit`, `position`); an empty tile carries
`data-ds-placeholder`. `menus` passes the header menus (the live card's `picture`, the use cases' `shots`).
