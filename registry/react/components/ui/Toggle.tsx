'use client'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'
import { useControllable } from '@/react/hooks/useControllable'

// A button that stays pressed: no fill at rest (soft gray text, the ghost fill under a hovering pointer) or, as
// `outline`, a #666666 hairline; pressed it takes the primary White with Black text, the brand's one White state. Sizes
// follow the button's: sm 32px, md 40px, lg 56px; `icon` makes it square (put its name in aria-label). Nothing scales on press
// (the site's controls do not); colors change over 160ms. Icons never move. `pressed`
// with `onPressedChange` controls it (or `defaultPressed` alone). Every other prop lands on the <button>.
export type ToggleVariant = 'default' | 'outline'
export type ToggleSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ToggleVariant, string> = {
  default: 'bg-transparent',
  outline: 'border border-edge-strong bg-surface aria-pressed:border-action-primary not-aria-pressed:hover:not-disabled:border-action-secondary-edge-hover',
}
const SIZES: Record<ToggleSize, string> = { sm: 'h-control-sm gap-1.5 type-ui-strong', md: 'h-control-md gap-2 type-ui-strong', lg: 'h-control-lg gap-2 type-body font-medium' }
// One padding class per toggle, so a square toggle's 0 never competes with a label's padding.
const PADDING: Record<ToggleSize, string> = { sm: 'px-2.5', md: 'px-3', lg: 'px-4' }
const SQUARE: Record<ToggleSize, string> = { sm: 'w-control-sm px-0', md: 'w-control-md px-0', lg: 'w-control-lg px-0' }

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'> {
  /** default (no fill at rest) or outline (a hairline). */
  variant?: ToggleVariant
  /** sm (32px), md (40px) or lg (48px). */
  size?: ToggleSize
  /** A square icon toggle: put its name in aria-label. */
  icon?: boolean
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  children?: ReactNode
}

export function toggleClasses({ variant = 'default', size = 'md', icon }: Pick<ToggleProps, 'variant' | 'size' | 'icon'> = {}) {
  return cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control whitespace-nowrap select-none text-fg-soft',
    'transition-[background-color,color,border-color] duration-160 ease-out',
    'not-aria-pressed:hover:not-disabled:bg-action-ghost-hover not-aria-pressed:hover:not-disabled:text-fg aria-pressed:bg-action-primary aria-pressed:text-action-primary-fg aria-pressed:hover:not-disabled:bg-action-primary-hover',
    'disabled:cursor-not-allowed disabled:text-action-disabled-fg disabled:aria-pressed:bg-action-disabled',
    SIZES[size],
    icon ? SQUARE[size] : PADDING[size],
    VARIANTS[variant],
  )
}

export function Toggle({ variant = 'default', size = 'md', icon, pressed, defaultPressed = false, onPressedChange, className, children, ...rest }: ToggleProps) {
  const [on, setOn] = useControllable(pressed, defaultPressed, onPressedChange)
  return <button data-ds="toggle" type="button" {...rest} className={cn(toggleClasses({ variant, size, icon }), className)} aria-pressed={on} onClick={() => setOn(!on)}>{children}</button>
}

export default Toggle
