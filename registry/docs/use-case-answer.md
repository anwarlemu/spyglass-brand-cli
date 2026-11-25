---
name: use-case-answer
title: Use case answer
type: registry:ui
group: site
description: "One question and the answer that came back, as the site shows it on a use case page: the question in a bubble (or the API request as code), the status, the lead, rows with a creative, a title and detail and a figure, a note and the tools called, on the raised panel."
use_for: "Showing what one question or one call returns, on a use case or product page. `example` takes the question, the rows and the calls; `mode: \"api\"` shows the request instead of a bubble."
never:
  - "Another brand's ads in the rows: pass your own creatives, or keep the neutral placeholders"
  - "Made-up figures presented as real: say they are illustrative in the source line under it"
  - "More than one answer per panel"
source: "Site pages/UseCasesPage/UseCaseAnswer (UseCaseAnswer.module.css): --surface panel 16px in (32 from 768) with 24px between parts (32 from 768); the question 12/16px in on --surface-inset, the 20px corner, at most 88%; the request 16px in (24 from 768) on Black, 14/20 mono in --text-2; the rows 16/24 with 12px above and below and a hairline on the surface, the 48px creative 16px from the text, the figure 20/28 with tabular numbers; the note above a hairline; the calls as 14/20 mono chips on --surface-inset"
files:
  - react/components/site/UseCaseAnswer.tsx
  - lib/use-case-answer.ts
examples:
  - "Chat | A question in chat"
  - "Api | An API request"
---
The figure column shows only when a row has a figure. In api mode the column heads take the mono face, as field names.

Each picture is an image slot (`src`, `alt`, `fit`, `position`); without `src` it keeps its placeholder, which carries
`data-ds-placeholder`.
