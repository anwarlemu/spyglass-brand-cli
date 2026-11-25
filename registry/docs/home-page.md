---
name: home-page
title: Home page
type: registry:block
group: pages
description: "The site's home, from library items in its order: the header, the playground hero, the proof row, the features, the reasons, the set-up steps beside the MCP session, the case stories, the pricing strip, the questions, the close among the creatives and the footer."
use_for: "A home page for a product agents use. Add it, then edit the copy in lib/pages/home.ts and lib/home/* or pass each block's content; the sections are library items you can reorder or drop."
never:
  - "Third-party customers, logos or ads without permission: every default is an Acme placeholder"
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
source: "Site app/page.tsx and app/v2/page.tsx (V3Playground hero, V3Proof, V2Features, V2Why, V2HowItWorks, V3CaseStories, V2Pricing, V3Faq, V3Close, the header and footer), measured at 1440 and 390; built from ascii-trail, playground-hero, proof-block, features-block, why-block, how-it-works-block, case-stories-block, pricing-panels-block, faq-block, close-block, site-header and site-footer"
files:
  - react/components/pages/HomePage.tsx
  - lib/pages/home.ts
examples:
  - "Page | Home | bleed"
---
`sections` lists the sections to show, in order (`hero`, `proof`, `features`, `why`, `steps`, `stories`, `pricing`,
`faq`, `close`); a key left out is not shown. `blocks` gives each block its own data, pictures included:
`hero.session`, `features` (`ads`, `burst` with each search's `images`, `ring`, `tally`), `why` (`creatives`, `logo`),
`steps.session`, `stories` (`cases` with each `picture`, `quotes`), `pricing.sets` and `close.creatives`. `menus`
passes the header menus (the live card's `picture`, the use cases' `shots`). Each picture is an image slot (`src`,
`alt`, `fit`, `position`); without `src` it keeps its placeholder, which carries `data-ds-placeholder`.
