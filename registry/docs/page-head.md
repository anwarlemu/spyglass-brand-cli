---
name: page-head
title: Page head
type: registry:ui
group: site
description: "The site's page head: the page title as the section head with its lines breaking from 768, a lead in the soft gray, a White and a quiet button (or a control in the White one's place), and an ASCII drift in the right columns or fading in from the edge when centered. The error head is the same with a retry button."
use_for: "The top of an inner page (resources, use cases, legal, coming soon, 404 and error pages); `align=\"centre\"` for pricing-style pages; `control` to put a connect menu or a form in the White button's place; `visual` for your own picture on the right."
never:
  - "More than one White button: with a control, the White button is left out"
  - "A display-size title: page heads use the section head (56px at most)"
  - "Moving drifts: the texture holds still"
source: "Site pages/PageHead (PageHead.tsx, ErrorHead.tsx, PageHead.module.css) and ui/AsciiDrift: 64px above (96 at 768, 128 at 1024), 80 below (96 at 768); .t-head title; 24px between the title and the body; .t-lead in --text-2 at 640px; actions 40px below, 12px apart, stacked on phones; margin: 7fr and 5fr columns from 768 (48px apart, 64 from 1024), the cluster crop at -64px top and bottom, at least 160px tall; centre: the mass crop from the right, from 1024, half the width less 320px"
files:
  - react/components/site/PageHead.tsx
  - react/components/site/ErrorHead.tsx
examples:
  - "Margin | Copy left, drift right | bleed"
  - "Centre | Centered | bleed"
  - "Eyebrow | With an eyebrow, no buttons | bleed"
  - "Error | The error head | bleed"
---
