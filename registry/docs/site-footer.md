---
name: site-footer
title: Site footer
type: registry:block
group: blocks
description: "The site's footer: the wordmark across the page in the footer gray with the brand light through it, and a #262626 card rising over its descender with the link columns, the lockup and the legal line."
use_for: "The foot of a marketing site's pages, as spyglass.so ends. For posts, ads and a plain band use the footer row or the footer block."
never:
  - "The wordmark in a spectrum color or White: it is the footer gray, and the light is the only color in it"
  - "Links that move on hover, or social icons in color"
  - "Real company or customer names in the columns"
source: "Site site/Footer (Footer.tsx, Footer.module.css): card 48px in with a #363636 hairline and the 8px corner, titles Funnel Display 20/24, links DM Sans 16/24 #D4D4D4, six columns from 1280, the wordmark in --grey-wordmark #373737 overlapped by half its descender"
files:
  - react/components/blocks/SiteFooter.tsx
examples:
  - "Site | Six columns and a legal line | bleed"
---
