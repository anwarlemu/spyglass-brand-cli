---
name: browser-frame
title: Browser frame
type: registry:ui
group: site
description: "The site's browser window around a screenshot or a live part of a page: a #262626 window with a #4D4D4D hairline, three gray dots, the address in a small pill, and an optional footer row."
use_for: "Showing a product page, a dashboard or a result inside a page or an asset, as the site frames its own screens."
never:
  - "Colored window dots: they are #666666 on the site"
  - "A drop shadow or a glow around the window"
  - "Another company's site in the address"
source: "Site ui/BrowserFrame (BrowserFrame.module.css): 28px bar, 8px dots in --line-strong, the address pill 20px tall in --surface-inset with 12/16 text, the window in --surface with a --line-surface hairline and --radius-m"
files:
  - react/components/site/BrowserFrame.tsx
examples:
  - "Page | A page in the window | center"
---
