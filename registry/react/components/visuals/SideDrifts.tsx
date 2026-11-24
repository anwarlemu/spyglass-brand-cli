import { AsciiDrift } from '@/react/components/visuals/AsciiDrift'
import { cn } from '@/react/lib/cn'

// The site's side drifts (ui/SideDrifts): from 1440 wide, where the content column leaves room at the sides, a column
// crop of the ASCII texture fades in from the left edge and a mass crop from the right, each 40% of the section's height
// and as wide as the margin beside the content less 16px. Below 1440 they are gone. Put it inside a positioned section
// (`relative isolate`); the drifts sit behind the content and never move. Decoration: hidden from assistive tech.
export type SideDriftPlace = 'top' | 'middle' | 'bottom'
export interface SideDriftsProps {
  /** Where the left drift sits (top 8%, middle 30%, bottom 52%), or false for none. */
  left?: SideDriftPlace | false
  /** Where the right drift sits, or false for none. */
  right?: SideDriftPlace | false
  className?: string
}

const SIDE = 'hidden min-[1440px]:block min-[1440px]:h-[40%] min-[1440px]:w-[calc((100vw-var(--ds-layout-content))/2-var(--ds-space-lg))]'
const PLACE: Record<SideDriftPlace, string> = { top: 'min-[1440px]:top-[8%]', middle: 'min-[1440px]:top-[30%]', bottom: 'min-[1440px]:top-[52%]' }

export function SideDrifts({ left = 'top', right = 'bottom', className }: SideDriftsProps) {
  return (
    <span data-ds="side-drifts" aria-hidden="true" className={cn('contents', className)}>
      {left ? <AsciiDrift crop="column" from="left" className={cn(SIDE, 'min-[1440px]:left-0', PLACE[left])} /> : null}
      {right ? <AsciiDrift crop="mass" from="right" className={cn(SIDE, 'min-[1440px]:right-0', PLACE[right])} /> : null}
    </span>
  )
}

export default SideDrifts
