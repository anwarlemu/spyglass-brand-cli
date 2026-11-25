---
name: how-it-works-block
title: How it works block
type: registry:block
group: blocks
description: "The home's set-up section: the headline, the lead, three numbered steps between hairlines, the connect menu beside the quiet button and the clients' marks, with the MCP session playing beside them from 1024."
use_for: "Showing how to start in three steps, with the product answering a real question next to them."
never:
  - "Other companies' logos without permission: the default marks are first letters"
  - "More than three steps"
  - "Marks that move on hover: the others dim and the name appears"
source: "Site v2/V2HowItWorks (V2HowItWorks.tsx and .module.css, Session.tsx and .module.css, sessionClock.ts, content/v2/how-it-works): five to seven columns 64px apart from 1024, 48px stacked; steps 16px tall padding between hairlines with a 32px number column; actions 12px apart, 40px under the steps; marks 40px tiles 8px apart; the session stage 480px least, 40px in (24/16 on phones), the window's foot fading over 96px; the column drift at the left from 1440; on phones the connect menu hidden and the quiet button White (globals.css [data-mcp-pair])"
files:
  - react/components/blocks/HowItWorksBlock.tsx
  - lib/home/how-it-works.ts
examples:
  - "Steps | Acme rows and questions | bleed"
---
