import type { AnchorHTMLAttributes, ButtonHTMLAttributes, Ref } from 'react'
import { cn } from '@/react/lib/cn'

// The brand's button: a White fill with a Black DM Sans Medium label and the 10px canvas corner (8px here), 56px tall
// on the canvas and 40px in the product (md). One primary per view; secondary is a #262626 fill for the rest; ghost
// has no fill until hovered, for tools in rows. Sizes sm (32px), md (40px) and lg (48px); `icon` makes it square.
// Hover changes the fill only where a pointer hovers; a press gives a little (scale 0.97, 150ms ease-out), never on
// hover, and not with reduced motion. Disabled is a #1A1A1A fill with a #4D4D4D label, never faded. `href` renders a
// link that looks the same.
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-action-primary text-action-primary-fg hover:not-disabled:bg-action-primary-hover',
  secondary: 'bg-action-secondary text-action-secondary-fg hover:not-disabled:bg-action-secondary-hover',
  ghost: 'bg-transparent text-fg hover:not-disabled:bg-action-ghost-hover',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-control-sm gap-1.5 px-3 type-ui-strong',
  md: 'h-control-md gap-2 px-4 type-ui-strong',
  lg: 'h-control-lg gap-2 px-5 type-body font-medium',
}

const SQUARE: Record<ButtonSize, string> = { sm: 'w-control-sm px-0', md: 'w-control-md px-0', lg: 'w-control-lg px-0' }

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** primary (White), secondary or ghost. */
  variant?: ButtonVariant
  /** sm (32px), md (40px) or lg (48px). */
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
    'transition-[background-color,color,scale] duration-150 ease-out active:not-disabled:scale-97 motion-reduce:active:not-disabled:scale-100',
    'disabled:cursor-not-allowed disabled:bg-action-disabled disabled:text-action-disabled-fg',
    SIZES[size],
    icon && SQUARE[size],
    VARIANTS[variant],
  )
}

export function Button({ variant = 'primary', size = 'md', icon, href, type = 'button', disabled, className, children, ref, ...rest }: ButtonProps) {
  const classes = cn(buttonClasses({ variant, size, icon }), className)
  if (href) return <a data-ds="button" ref={ref} href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>
  return <button data-ds="button" ref={ref} type={type} disabled={disabled} className={classes} {...rest}>{children}</button>
}

export default Button
