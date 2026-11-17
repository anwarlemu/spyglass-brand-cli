import { DatePicker } from '@/react/components/ui/DatePicker'
// A day already picked, read in full; days after today can't be picked.

export default function Picked() {
  return (
    <div className="h-110 w-full max-w-80">
      <DatePicker defaultValue={new Date(2026, 10, 3)} max={new Date(2026, 10, 17)} format={{ weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }} />
    </div>
  )
}
