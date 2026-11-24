---
name: connect-menu
title: Connect menu
type: registry:ui
group: site
description: "The site's connect menu: a White button that opens a panel of the agents your MCP server can be added to, each row with its mark or first letter, a muted line and Open, plus a row that copies a setup prompt for any other agent; a pill slides to the row under the pointer or focus."
use_for: "A hero or a page head's main action when the product connects to agents (MCP); `up` near the foot of a page; pass `marks` and each client's `mark` only when you may show them."
never:
  - "Third-party logos without permission: by default rows show their first letter and the button shows no marks"
  - "A second White button beside it: pair it with a quiet one"
  - "Arrows that move on hover: they change color only"
  - "Shadows under the panel: it sits on a hairline"
source: "Site v3/V3Playground ConnectMenu (ConnectMenu.module.css, content/v3/connect.ts): the .btn--primary trigger at 12px in with a 16px chevron that turns over; the panel 8px under it, 336px (100% under 768), 4px in, #1A1A1A in a --line hairline with an 8px corner; rows 8px in with a 32px tile, 14/20 Medium name over a 12/16 --text-3 line; a hairline; the copy row 40px (48 on phones); the --surface sliding pill; 160ms in and 120ms out from scale 0.96. The library drops the panel shadow, keeps the arrow still, and opens at once from the keyboard"
files:
  - react/components/site/ConnectMenu.tsx
  - lib/connect.ts
examples:
  - "Default | Acme rows | center half"
  - "Up | Opening above | center half"
---
