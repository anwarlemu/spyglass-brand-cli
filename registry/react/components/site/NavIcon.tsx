import { CHEVRON_PATH, navIconPaths, type NavIconName } from '@/lib/site-header'
import { cn } from '@/react/lib/cn'

// The site's menu glyphs (site/Header NavIcon): two tones on a 24px grid, the body in the gray and the lit part in the
// soft gray, both brightening when the row they sit in is active (--glyph-body, --glyph-lit). And the menus' chevron.
export interface NavIconProps {
  name: NavIconName
  /** 20 or 24px. */
  size?: 20 | 24
  className?: string
}

export function NavIcon({ name, size = 20, className }: NavIconProps) {
  return <svg data-ds="nav-icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" className={cn('block flex-none', className)} dangerouslySetInnerHTML={{ __html: navIconPaths(name) }} />
}

export function Chevron({ size = 12, className }: { size?: 12 | 16; className?: string }) {
  return <svg viewBox="0 0 12 12" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={cn('flex-none', className)} dangerouslySetInnerHTML={{ __html: CHEVRON_PATH }} />
}

export default NavIcon
