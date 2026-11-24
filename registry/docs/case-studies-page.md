---
name: case-studies-page
title: Case studies page
type: registry:block
group: pages
description: "The site's case studies index: the header, the page head, the home's case stories without their head (each case as a wide picture with its panel, then every quote in cards three across), the closing section and the footer."
use_for: "An index of customer stories; `content` takes the cases (each linking to its case study page) and the quotes."
never:
  - "Customers' names, marks, photos or quotes you may not show: the defaults are Acme placeholders"
  - "A case without a concrete figure"
  - "A second head over the stories: the page head names the page"
source: "Site app/resources/case-studies/page.tsx and pages/CaseStudies (CaseStudyIndex.tsx, .module.css): PageHead, then CaseStoriesGrid with every quote in the container with 96px under it, PageClose and the footer"
files:
  - react/components/pages/CaseStudiesPage.tsx
examples:
  - "Page | Case studies | bleed"
---
