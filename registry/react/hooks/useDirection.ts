'use client'
import { createContext, useContext } from 'react'

// The reading direction a Direction wrapper provides to what is inside it, so a component can flip what it draws
// (an arrow, a slide) for right-to-left text. Outside any wrapper it reads `ltr`.
export type Dir = 'ltr' | 'rtl'
export const DirectionContext = createContext<Dir>('ltr')

export function useDirection() {
  return useContext(DirectionContext)
}
