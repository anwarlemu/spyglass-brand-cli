---
name: templates-page
title: Templates page
type: registry:block
group: pages
description: "The site's templates page, from library items: the header, the templates wall as the hero, the automation run, what each template brings back (a centered head over a row per template), the questions, the close with two buttons and the footer."
use_for: "A page introducing templates or playbooks. Edit lib/pages/templates.ts or pass `content`; `fan` (the `fan` slot in web components) takes the rows as the row fan arranges them."
never:
  - "Another brand's ads or creators in the wall, the run or the rows: pass your own or keep the placeholders"
  - "More than one White button in a section"
  - "A schedule or a price the template does not state"
source: "Site app/templates/page.tsx (V2Templates as h1, AutomationRun with templatesPage.run, TemplateCities, V3Faq, PageClose with control null) and pages/TemplatesPage/TemplateCities(.module.css), tokens.css 840-931: the head trimmed at the cap, the lead 16px under it, the rows 48px under (72 at 768), each row padded 16px with 128px under it on phones (136 at 768, 16 from 1024 with 40 between rows), the names 32/36, 44/48 at 768 and 64/68 at 1024 in Funnel Display 400; copy from content/pages/templates.ts and templatesCities.ts with third-party names left out"
files:
  - react/components/pages/TemplatesPage.tsx
examples:
  - "Page | Templates page | bleed"
---
The wall holds a still frame with reduced motion and the run holds its batch at rest. Each row is a link to its use case
with the template's schedule for assistive tech. The room under each row on phones is where the row fan opens a row's
items; pass the fan through `fan` and the rows keep their names and links.
