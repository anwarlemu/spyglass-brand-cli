---
name: auth-page
title: Sign-in page
type: registry:block
group: pages
description: "The sign-in and sign-up page: the light field, the lockup, a card with the email and password fields and the one White button."
use_for: "Sign-in and sign-up screens; `mode` picks the copy, the form posts to `action`."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a view"
  - "Real people or customers in the copy: Acme only"
source: "Built from the library and the site's surfaces (cards on --surface, the rail on --raised, hairlines, the 36px links of the header)"
files:
  - react/components/pages/AuthPage.tsx
  - lib/pages/auth.ts
examples:
  - "SignIn | Sign in | bleed"
---
