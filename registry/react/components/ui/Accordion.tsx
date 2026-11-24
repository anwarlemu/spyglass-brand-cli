'use client'
import type { ReactNode } from 'react'
import { AccordionContext } from '@/react/hooks/useAccordion'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// shadcn's accordion in the brand: a stack of disclosures on Black with neutral hairlines between the rows, a muted
// chevron that turns as a row opens, the row opening to its content's height over 320ms on the strong ease-out and
// closing in 160ms. One open at a time by default (a second press closes it); `multiple` lets several stay open.
// `value` with `onValueChange` (or `defaultValue` alone) is the open row's value, or the list of them with `multiple`.
// Compose with AccordionItem.
export type AccordionValue = string | string[] | null
export interface AccordionProps {
  /** Several rows stay open. */
  multiple?: boolean
  /** The open row's value, or the list of them with `multiple`. */
  value?: AccordionValue
  defaultValue?: AccordionValue
  onValueChange?: (value: AccordionValue) => void
  className?: string
  children?: ReactNode
}

export function Accordion({ multiple, value, defaultValue = null, onValueChange, className, children }: AccordionProps) {
  const [model, setModel] = useControllable<AccordionValue>(value, defaultValue, onValueChange)
  const list = Array.isArray(model) ? model : model ? [model] : []
  const ctx = {
    isOpen: (v: string) => list.includes(v),
    toggle: (v: string) => {
      if (multiple) setModel(list.includes(v) ? list.filter(x => x !== v) : [...list, v])
      else setModel(list.includes(v) ? null : v)
    },
  }
  return (
    <AccordionContext.Provider value={ctx}>
      <div data-ds="accordion" className={cn('border-t border-edge', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

export default Accordion
