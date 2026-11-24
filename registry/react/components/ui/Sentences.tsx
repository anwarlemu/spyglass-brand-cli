import { Fragment } from 'react'
import { cn } from '@/react/lib/cn'

// The site's sentence keeper (ui/Sentences): a line of copy split after each sentence, so below 768 each sentence wraps
// as a whole (inline-block) instead of leaving one word alone on a line; wider, it reads as plain text.
export interface SentencesProps {
  text: string
  className?: string
}

export function Sentences({ text, className }: SentencesProps) {
  const parts = text.split(/(?<=[.!?])\s+/)
  return (
    <span data-ds="sentences" className={cn('contents', className)}>
      {parts.map((part, i) => (
        <Fragment key={`${i}-${part}`}>
          {i > 0 ? ' ' : null}
          <span className="max-md:inline-block">{part}</span>
        </Fragment>
      ))}
    </span>
  )
}

export default Sentences
