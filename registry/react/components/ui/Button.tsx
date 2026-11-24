'use client'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PointerEvent, Ref } from 'react'
import { cn } from '@/react/lib/cn'
import { followGlow } from '@/lib/glow'

// The site's button (globals.css .btn): a White fill with a Black DM Sans Medium 14/20 label and an 8px corner, 40px
// tall with 16px in (md). One primary per view; secondary is the site's quiet button, a #1A1A1A fill inside a #363636
// hairline ring that turns #262626 under the pointer; ghost has no fill until hovered, for tools in rows. Sizes sm
// (32px), md (40px) and lg (56px, 32px in, a 20/28 label); `icon` makes it square. Under a mouse a White glow follows
// the pointer inside it and the fill changes (160ms on the site's ease-out); like the site, it does not scale on press.
// Disabled is a #1A1A1A fill with a #666666 label, never faded. `href` renders a link that looks the same.
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'form'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-action-primary text-action-primary-fg hover:not-disabled:bg-action-primary-hover',
  secondary: 'bg-action-secondary text-action-secondary-fg shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-action-secondary-edge)] hover:not-disabled:bg-action-secondary-hover',
  ghost: 'bg-transparent text-fg hover:not-disabled:bg-action-ghost-hover',
}

const SIZES: Record<ButtonSize, string> = {
  xs: 'h-control-xs gap-1.5 type-ui-strong',
  sm: 'h-control-sm gap-1.5 type-ui-strong',
  md: 'h-control-md gap-2 type-ui-strong',
  lg: 'h-control-lg gap-2 type-body-lg font-medium',
  form: 'h-control-form gap-3 type-body font-medium',
}

// The site's glow (globals.css .btn::before): a gradient layer under the label at the pointer, shown on hover only.
const GLOW =
  'relative isolate overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(circle_var(--ds-glow-radius)_at_var(--glow-x,50%)_var(--glow-y,50%),var(--ds-color-action-glow),transparent)] before:opacity-0 before:transition-opacity before:duration-240 before:ease-out hover:not-disabled:before:opacity-100'
// One padding class per button, so a square button's 0 never competes with a label's padding in the stylesheet.
const PADDING: Record<ButtonSize, string> = { xs: 'px-4', sm: 'px-3', md: 'px-4', lg: 'px-8', form: 'px-4' }
const SQUARE: Record<ButtonSize, string> = { xs: 'w-control-xs px-0', sm: 'w-control-sm px-0', md: 'w-control-md px-0', lg: 'w-control-lg px-0', form: 'w-control-form px-0' }

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** primary (White), secondary or ghost. */
  variant?: ButtonVariant
  /** xs (36px, the site header's), sm (32px), md (40px), lg (56px) or form (48px, a short form's buttons, full width). */
  size?: ButtonSize
  /** A square icon button: put its name in aria-label. */
  icon?: boolean
  /** Renders a link. */
  href?: string
  type?: 'button' | 'submit' | 'reset'
  ref?: Ref<HTMLButtonElement & HTMLAnchorElement>
}

export function buttonClasses({ variant = 'primary', size = 'md', icon }: Pick<ButtonProps, 'variant' | 'size' | 'icon'> = {}) {
  return cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control whitespace-nowrap select-none',
    'transition-[background-color,color] duration-160 ease-out',
    GLOW,
    'disabled:cursor-not-allowed disabled:bg-action-disabled disabled:text-action-disabled-fg',
    SIZES[size],
    icon ? SQUARE[size] : PADDING[size],
    VARIANTS[variant],
  )
}

export function Button({ variant = 'primary', size = 'md', icon, href, type = 'button', disabled, className, children, ref, onPointerMove, ...rest }: ButtonProps) {
  const classes = cn(buttonClasses({ variant, size, icon }), className)
  const move = (event: PointerEvent<HTMLButtonElement & HTMLAnchorElement>) => {
    followGlow(event.currentTarget, event)
    onPointerMove?.(event)
  }
  if (href) return <a data-ds="button" ref={ref} href={href} className={classes} onPointerMove={move} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>
  return <button data-ds="button" ref={ref} type={type} disabled={disabled} className={classes} onPointerMove={move} {...rest}>{children}</button>
}

export default Button
