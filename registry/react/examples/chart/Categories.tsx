'use client'
import { LineChart, type LineSeries } from '@/react/components/ui/LineChart'
// New creatives found per day by category over two weeks: six series in the brand's order, the neutrals first, then
// the spectrum. Point at the plot to read a day. Sample data.
const day = (i: number) => Date.UTC(2026, 10, 2 + i)
const categories = ['Skincare', 'Snacks', 'Fitness', 'Beverages', 'Apparel', 'Home']
const series: LineSeries[] = categories.map((label, k) => ({
  label,
  points: Array.from({ length: 14 }, (_, i) => ({ t: day(i), v: Math.round(120 - k * 16 + ((i * (k + 3) * 7) % 11) * 4 + i * (3 - k * 0.4)) })),
}))
const count = (v: number) => `${Math.round(v)} creatives`

export default function Categories() {
  return (
    <div className="w-full max-w-238">
      <LineChart title="New creatives per day" series={series} format={count} />
    </div>
  )
}
