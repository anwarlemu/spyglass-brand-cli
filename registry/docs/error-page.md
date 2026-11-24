---
name: error-page
title: Error page
type: registry:block
group: pages
description: "The site's error page: what shows when a page fails to render, the error head alone on Black (the title in one line, what happened in a plain sentence, the White Try again and the quiet way home), with no header or footer."
use_for: "An app's or a website's error boundary (Next's error.tsx and global-error.tsx). Try again calls `onRetry` (React) or fires `retry` (web component)."
never:
  - "An error code, a stack trace or a joke as the title"
  - "More than one White button in a view"
  - "The header and footer: the page that failed may be what draws them"
source: "Site app/error.tsx, app/global-error.tsx, pages/PageHead/ErrorHead.tsx and content/pages/errors.ts: the page head without the drift, the White retry beside the quiet homepage link; main's last section keeps --section-y under it"
files:
  - react/components/pages/ErrorPage.tsx
  - lib/pages/error.ts
examples:
  - "Page | Error page | bleed"
---
