import { Calendar } from '@/react/components/ui/Calendar'
// A flight window: weeks start on Monday, only days from November 9 to December 11 can be picked, and never a Sunday.

export default function Window() {
  return <Calendar label="Flight start" weekStartsOn={1} defaultValue={new Date(2026, 10, 24)} min={new Date(2026, 10, 9)} max={new Date(2026, 11, 11)} disabled={(d) => d.getDay() === 0} />
}
