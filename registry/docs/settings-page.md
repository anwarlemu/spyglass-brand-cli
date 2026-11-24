---
name: settings-page
title: Settings page
type: registry:block
group: pages
description: "A settings page: the side rail, profile fields and notification switches on cards, and the save button."
use_for: "Account or workspace settings; the form posts to `action`."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a view"
  - "Real people or customers in the copy: Acme only"
source: "Built from the library and the site's surfaces (cards on --surface, the rail on --raised, hairlines, the 36px links of the header)"
files:
  - react/components/pages/SettingsPage.tsx
  - lib/pages/settings.ts
examples:
  - "Page | Settings | bleed"
---
