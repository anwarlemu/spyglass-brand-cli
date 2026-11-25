---
name: site-header
title: Site header
type: registry:ui
group: site
description: "The site's header: the lockup, the links with their dropdown menus (products beside a live card, use cases beside a picture card, resources beside the docs card with the brand light), the sign-in and the one White key; on phones a sheet that reveals downward with the menus as disclosures. A Black ground and a hairline once the page scrolls."
use_for: "The top of every website page. `links` entries with `menu` open the products, use cases or resources menu; `menus` carries their content (Acme by default, pictures only through `picture` and `shots`); `hideKeyUntil` holds the key back until a hero's actions scroll under the bar; `variant` centered shows the links from 1024, minimal keeps only the lockup and the key."
never:
  - "Two White buttons in the header"
  - "Platform logos in the menus: platforms are named in words"
  - "People's photos as default pictures: pass your own shots"
  - "Menus that animate when opened from the keyboard"
  - "Icons that move on hover"
source: "Site site/Header (Header, NavMenus, MenuPanels, ProductsLivePanel, LiveVisual, HeaderKey, HomeLink, NavIcon, ScrollGround, MenuSheet, SheetDisclosure, Header.module.css) and ui/WarmPictures: 64/72px bar in the container, grid 1fr auto 1fr from 1280; links 36px, 16px in, --text-2, --surface under the pointer; panels 24px under the links on --raised in a --line hairline with an 8px corner, 874, 944 and 556px wide, rising 8px from scale 0.96 over --dur (--dur-fast out), opening after 80ms of hover and closing 240ms after the pointer leaves; rows 12px in, a 40px glyph tile, 14/20 Medium names over --text-3 lines; the live card 540px crossfading in 200ms; the strip 32px links over a hairline; the key --control-xs, Get API key under 424px; the sheet a modal dialog clipped open from the bar, 24/28 Funnel Display rows under hairlines, the foot pinned. The library names platforms in words, takes pictures through props, and opens menus at once from the keyboard"
files:
  - react/components/site/SiteHeader.tsx
  - react/components/site/NavMenus.tsx
  - react/components/site/MenuPanels.tsx
  - react/components/site/ProductsLivePanel.tsx
  - react/components/site/MenuSheet.tsx
  - react/components/site/SheetDisclosure.tsx
  - react/components/site/NavIcon.tsx
  - lib/site-header.ts
  - lib/home-link.ts
examples:
  - "Default | With the menus | bleed"
  - "Centered | Links from 1024 | bleed"
  - "Minimal | Minimal | bleed"
---
The menus open on hover, focus or click as on the site; from the keyboard they appear at once with focus on their first
link, arrows move through them and Escape returns focus to their link. The phone sheet is a modal dialog: focus stays
inside it and Escape returns it to the menu button.
