---
name: input-otp
title: Input OTP
type: registry:ui
group: ui
description: "A one-time code, one cell per character, each cell drawn as the input. It is one real field, so paste and the phone's code suggestion work."
use_for: "Sign-in and verification codes sent by email or text. Say under it where the code went."
never:
  - "Passwords or keys"
  - "Cells that move focus on their own: it is one field"
  - "A colored or glowing cell for the one being typed: its hairline turns White"
source: "Derived from the brand guidelines (no code field in the brand assets): the input's hairline, fill and corner, DM Sans for the digits"
files:
  - react/components/ui/InputOtp.tsx
examples:
  - "Verify | Signing in | center"
  - "States | Invalid and disabled | center"
---
