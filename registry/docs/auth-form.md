---
name: auth-form
title: Auth form
type: registry:block
group: site
description: "The site's sign-in and sign-up form in a 400px column: the title and lead, a quiet provider button, the or rule, the email field with its message beside the label, the one White button, the legal line and the way to the other mode; a pressed button shows a spinner until the app takes over."
use_for: "Signing in or up on a page of your own, or inside a dialog; the sign-in page uses it."
never:
  - "A third-party logo shipped with the library: the provider's mark comes in through `providerIcon` (the `provider-icon` slot)"
  - "A second White button"
  - "Errors in red: the message is White beside the label and the field's ring turns White"
source: "Site pages/Auth/AuthForm and Auth.module.css: title h4 32/36, h3 40/44 from 768, at 450; lead --text-2 12px under; controls 48px (--control-m) with 16/24 labels; the or rule 14/20 --text-3 between --line hairlines, 16px above and below; the field on --raised with an inset --line ring, 8px corner; legal 14/20 --text-off with --text-2 links; the spinner 20px, a 2px ring turning every 800ms"
files:
  - react/components/site/AuthForm.tsx
  - lib/pages/auth.ts
examples:
  - "Form | Sign up | center"
---
