---
name: auth-page
title: Sign-in page
type: registry:block
group: pages
description: "The site's sign-in and sign-up page: Black with the site's own light images in two corners bobbing slowly, two ASCII crops from 1024, the lockup bar, the form centered in the height left, and the proof row of marks under it."
use_for: "Sign-in and sign-up screens; `mode` picks the copy, `onProvider` and `onEmail` (events in web components) take the presses."
never:
  - "A third-party logo shipped in the provider button or the proof row: pass the marks you may show"
  - "More than one White button in a view"
  - "Real people or customers in the copy: Acme only"
  - "Light that keeps moving with reduced motion"
source: "Site app/(auth) and pages/Auth (AuthShell, AuthForm, AuthProof, Auth.module.css): the lights public/brand/light/auth-light-*.webp at min(29vw, 520px) (144px, top right only, on phones), 11:16, bobbing 12px over 14s on --ease-drift; ASCII drifts 36% by 44% from 1024; the bar 64/72px with the 20px lockup; main centered with 64px between the form and the proof row, 32px in"
files:
  - react/components/pages/AuthPage.tsx
examples:
  - "SignUp | Sign up | bleed"
  - "SignIn | Sign in | bleed"
---
