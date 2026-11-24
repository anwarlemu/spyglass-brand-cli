---
name: mcp-session
title: MCP session
type: registry:ui
group: site
description: "An AI chat asking an MCP server questions in turn: each typed at a typist's rhythm, the tool call and reply settling in, four creatives arriving one by one and the table's rows rising into place, then the next question."
use_for: "Showing the product answering in an agent, beside set-up steps or in a hero."
never:
  - "Real brands' names or ads in the questions without permission: the defaults are Acme"
  - "Playing with reduced motion: it rests on the first answer"
source: "Site v2/V2HowItWorks Session (Session.tsx, Session.module.css, sessionClock.ts and the hero reference timings): 60 frames a second, the settle from 90% over 18 steps, the type fade over 6 frames, the rows rising from 68px on the reference curve, plays from a quarter on screen"
files:
  - react/components/site/McpSession.tsx
  - lib/home/session.ts
examples:
  - "Session | Acme questions | center"
---
