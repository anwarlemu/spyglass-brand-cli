'use client'
import { createContext, useContext } from 'react'

// What an Accordion gives its items: whether a value is open, and the press that opens or closes it.
export type AccordionContextValue = { isOpen: (v: string) => boolean, toggle: (v: string) => void }
export const AccordionContext = createContext<AccordionContextValue | null>(null)

/** The Accordion around an item, or null outside one. */
export function useAccordion() {
  return useContext(AccordionContext)
}
