---
name: product-example
title: Product example
type: registry:ui
group: site
description: "The site's product example: the specs (endpoint, MCP tool, rate limit), the request as the code block in tabs beside the response panel from 1024 (the request staying in view as the page scrolls), the JSON scrolling across and fading at its edge, and optionally the creatives it returned, three across with a line each."
use_for: "Showing one real request and what comes back on a product or docs page."
never:
  - "A response the API does not return"
  - "Keys or secrets in the code: use an environment variable"
  - "Colored syntax highlighting"
source: "Site pages/Products/Example (Products.module.css .specs, .example, .response, .responseHead, .responseBody, .media): specs 8px by 24px apart, t-label over mono values; the code tabs and the response 16px apart, two columns from 1024 with the request sticky at the header plus 32px; the response on --surface with --radius-m, a --control-l head 16px in (24 from 768) over a --line-surface hairline, the status in mono --text-3, the body 16px in (24 from 768) fading over 48px; returned creatives 3:4, three across 16px apart, small --text-2 lines"
files:
  - react/components/site/ProductExample.tsx
examples:
  - "Media | Media search | bleed"
---
`tabs` are the code block's tabs ({ id, label, code, language }); `media.items` are creative cards (`src`, or Acme
`brand`, `tone` and `caption`) with a `meta` line under each.
