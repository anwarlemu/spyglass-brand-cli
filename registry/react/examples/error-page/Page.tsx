'use client'
import { ErrorPage } from '@/react/components/pages/ErrorPage'
// The error page as the site sets it: Try again would render the page again.

export default function Page() {
  return <ErrorPage onRetry={() => {}} />
}
