---
name: site-header
title: Site header
type: registry:ui
group: site
description: "A website's header: the lockup on the left, the page links in DM Sans, a ghost sign-in and the one White button. On phones the links fold behind a menu button."
use_for: "The top of every website page. The White button is the page's main action (\"Get 50% off\"); the sign-in stays a ghost."
never:
  - "Two White buttons in the header"
  - "A colored or centered lockup"
  - "A header that animates as it opens on phones"
source: "Derived from the guidelines (Brand applications) and the assets' top row: the Spyglass lockup at the top left (183x28 at 64,64), the domain or a label at the right; buttons from Button, Get 50% off"
files:
  - react/components/site/SiteHeader.tsx
examples:
  - "Default | Default"
---
The panel on phones opens in place, without motion: it is a tool opened often. Escape closes it and returns focus to
the menu button.
