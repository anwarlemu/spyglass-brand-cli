---
name: page-close
title: Page close
type: registry:ui
group: site
description: "The site's closing section: a centered last head over its lines, a note in the soft gray, the connect menu with a quiet button (or a White and a quiet button), and from 1024 two ASCII drifts fading in at the corners."
use_for: "The last section before the footer on any site page; `control={null}` (connect=\"false\" in web components) for two plain buttons; `texture={false}` on a page that already has drifts nearby."
never:
  - "Two White buttons: beside the connect menu the button is quiet"
  - "A display-size head: it is the section head"
  - "Moving drifts"
source: "Site pages/PageClose (PageClose.tsx, PageClose.module.css, content/home closing): .section padding, 24px between the head, the note and the actions, the actions 16px further and 12px apart, stacked at full width under 768; drifts from 1024: the mass crop from the left, bottom at the section padding, min(50% - 320px, 480px) by 64%; the scatter crop from the right, top at the section padding, min(20%, 320px) by 48%"
files:
  - react/components/site/PageClose.tsx
examples:
  - "Default | With the connect menu | bleed"
  - "Buttons | Two buttons | bleed"
---
