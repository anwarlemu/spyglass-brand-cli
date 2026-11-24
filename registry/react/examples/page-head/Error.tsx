'use client'
import { ErrorHead } from '@/react/components/site/ErrorHead'
// The error page's head: try again, or go home.

export default function Error() {
  return <ErrorHead onRetry={() => {}} />
}
