'use client'
import { useState, type HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// shadcn's avatar in the brand: who or what something belongs to, in a circle. A `src` shows a picture cropped round;
// without one, or if it fails to load, the name's initials (two at most) in White DM Sans Medium on #262626. Sizes sm
// (24px, in a row), md (32px) and lg (40px). The name is read out; the picture is decoration.
export type AvatarSize = 'sm' | 'md' | 'lg'

const SIZES: Record<AvatarSize, string> = { sm: 'size-6 text-label', md: 'size-8 text-caption', lg: 'size-10 text-ui' }

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Whose it is: its initials, and the name for assistive tech. */
  name?: string
  /** A picture, cropped round. */
  src?: string
  /** sm (24px), md (32px) or lg (40px). */
  size?: AvatarSize
}

/** The first letters of the first two words. */
export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
}

export function Avatar({ name, src, size = 'md', className, ...rest }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  return (
    <span
      data-ds="avatar"
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-action-secondary leading-none font-medium text-fg select-none', SIZES[size] ?? SIZES.md, className)}
      role={name ? 'img' : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : 'true'}
      {...rest}
    >
      {src && !failed ? <img src={src} alt="" className="size-full object-cover" onError={() => setFailed(true)} /> : initials(name)}
    </span>
  )
}

export default Avatar
