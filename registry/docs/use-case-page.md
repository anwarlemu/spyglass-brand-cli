---
name: use-case-page
title: Use case page
type: registry:block
group: pages
description: "A use case's page as the site sets it: the hero with the connect menu and the chat answering beside it, the proof line over the marks, the scroll story, three stories, the wheel of audiences with the light around its ring, the FAQ, the closing section and the footer."
use_for: "One page per use case, solution or audience. `content` replaces the copy (lib/pages/use-case.ts); `visual=\"build\"` swaps the chat for the library visual (the site's build your own page)."
never:
  - "Real customers, quotes or photos in the stories: pass your own with permission, or keep Acme's"
  - "Another brand's creative in the hero, the story or the wheel: pass your own images"
  - "A second White button beside the connect menu"
source: "Site app/use-cases/[slug]/page.tsx and pages/UseCasesPage/UseCaseDetail.tsx: UseCaseHero, V3Proof, ScrollStory with the primary button and See templates, V3Stories (team layout, no customer row), V2UseCases with DispersionField ring seed 5, V3Faq with the docs button, PageClose, the footer"
files:
  - react/components/pages/UseCasePage.tsx
  - lib/pages/use-case.ts
examples:
  - "Page | Use case page | bleed"
---
Every section is a library item: `use-case-hero`, `proof-block`, `scroll-story`, `stories-block`, `use-case-wheel`
with `dispersion-field`, `faq-block` and `page-close`. `still` holds the wheel and its light for a still preview.
