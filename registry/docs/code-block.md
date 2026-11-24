---
name: code-block
title: Code block
type: registry:ui
group: site
description: "The site's tabs of code: a #262626 panel with a 56px head of tabs (a White line sliding under the chosen one) and a copy button whose label turns to Copied, over code in White with its punctuation and comments muted, scrolling across. Code and the copy button also stand alone."
use_for: "Requests and setup steps on product, docs and resource pages (`tabs` of { id, label, code, language }); `Code` alone inside a response panel or a card; `CopyButton` beside a URL or a key."
never:
  - "Colored syntax highlighting: only the muted gray and White"
  - "Code that wraps: it scrolls across and fades at its edges"
  - "A White copy button: it is quiet"
source: "Site sections/Connect (Code.tsx, CodeTabs.tsx, CopyButton.tsx, Connect.module.css .panel, .tab, .tabLine, .codePanel, .pre, .copy): --surface panel, --radius-m; head --control-l, 4px in (8 from 768), --line-surface hairline; tabs 14/20 Medium --text-3, 12px in (16 from 768), a --stroke White line on the sliding pill; .btn--quiet .btn--s copy at 80px or wider, --radius-s, labels crossing 4px over --dur-fast; panels 16px in (24 from 768), mono --small-size"
files:
  - react/components/site/CodeBlock.tsx
  - react/components/site/Code.tsx
  - react/components/site/CopyButton.tsx
  - lib/code.ts
examples:
  - "Tabs | Three requests | center"
  - "Single | One tab | center"
  - "Copy | A copy button beside a URL | center"
---
