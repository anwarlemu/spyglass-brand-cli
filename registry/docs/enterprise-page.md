---
name: enterprise-page
title: Enterprise page
type: registry:block
group: pages
description: "The site's enterprise page from library items: the header, the hero inside its ring of creatives, the logo row, the automation run under its quote, the eight features and the close with two buttons, then the footer."
use_for: "An enterprise or sales page; `content` replaces the copy, and `cards`, `logos`, `run` and `features` take your creatives and marks."
never:
  - "Customer logos, quotes or creatives you may not show: the defaults are Acme placeholders"
  - "A second White button in a section"
  - "The connect menu in the close: this page closes on a demo"
source: "Site app/enterprise and pages/Enterprise (EnterprisePage.tsx, Enterprise.module.css, LogoStrip.module.css) and content/pages/enterprise.ts: hero, logos (--ent-logos-above 24px, 16 from 768; --section-y below), AutomationRun, FeatureGrid, PageClose with two buttons and no texture"
files:
  - react/components/pages/EnterprisePage.tsx
  - lib/pages/enterprise.ts
examples:
  - "Page | Enterprise page | bleed"
---
`sections` lists the sections to show, in order (`hero`, `proof`, `run`, `features`, `close`); a key left out is not
shown. `cards`, `run` and `features` carry the pictures (image slots: `src`, `alt`, `fit`, `position`). `menus` passes
the header menus (the live card's `picture`, the use cases' `shots`).
