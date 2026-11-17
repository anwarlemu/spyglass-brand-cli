import { X } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { cn } from '@/react/lib/cn'

// One note: what just happened, in the card's #171717 fill with a #363636 hairline and the brand corner, no shadow. The
// title in DM Sans Medium, a muted line under it, one small White button beside them when there is something to do
// (Undo, View), and a close button when it can be dismissed. The Toaster (sonner) stacks these in a corner and times
// them; on its own it is a static note.
export interface ToastProps {
  /** What happened, in a few words. */
  title: string
  /** A line under the title. */
  description?: string
  /** One button beside the text. */
  action?: { label: string, onClick?: () => void }
  /** Shows the close button; called when it is pressed. */
  onDismiss?: () => void
  className?: string
}

export function Toast({ title, description, action, onDismiss, className }: ToastProps) {
  return (
    <div data-ds="toast" className={cn('flex w-full items-start gap-3 rounded-container border border-edge-strong bg-surface-raised p-4', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="type-ui-strong text-fg">{title}</p>
        {description && <p className="type-ui text-fg-muted">{description}</p>}
      </div>
      {action && <Button size="sm" className="-my-1.5" onClick={action.onClick}>{action.label}</Button>}
      {onDismiss && (
        <button type="button" className="-my-1.5 -mr-1.5 inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-muted transition-[background-color,color] duration-150 ease-standard hover:bg-action-ghost-hover hover:text-fg" aria-label="Dismiss" onClick={onDismiss}>
          <X size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default Toast
