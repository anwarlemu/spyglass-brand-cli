---
name: faq-block
title: FAQ block
type: registry:block
group: blocks
description: "The site's FAQ: the section head, a lead and a quiet button on the left, held under the header while the questions scroll by on the right; one answer open at a time, the rows sliding to make room and the plus turning to a minus. `layout=\"stack\"` puts the head over a narrow list. The rows also stand alone as FaqAccordion."
use_for: "The questions section of a home, pricing, product or contact page (place it in a section with the page's padding); FaqAccordion alone where the page sets its own head."
never:
  - "Answers the product does not state"
  - "More than one answer open at once"
  - "Colored question marks or icons"
source: "Site v3/V3Faq, ui/FaqAccordion and v2/V2Faq V2FaqList (V3Faq.module.css, V2Faq.module.css): 4fr and 7fr columns 64px apart from 1024, the head sticky at the header plus 32px, centered on phones; .t-lead 24px under the head, the quiet docs button 32px further; rows under --line hairlines, 20px (24 from 768) above and below a 20/28 --text-2 question, a 12px plus of 2px strokes; the answer 16/24 --text-2 at 640px, 24px (32 from 768) under; slots sized to the longest answer, rows sliding over --dur-move on --ease-out; the v2 list centered at 640 + 80px with its hairline at the foot"
files:
  - react/components/blocks/FaqBlock.tsx
  - react/components/blocks/FaqAccordion.tsx
  - lib/faq.ts
examples:
  - "Questions | Questions about the plan"
  - "Stack | Head over a narrow list"
  - "Rows | The rows alone"
---
