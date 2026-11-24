import { BrowserFrame } from '@/react/components/site/BrowserFrame'
// A page of Acme's inside the browser window, with a footer row.

export default function Page() {
  return (
    <div className="h-80 w-full max-w-160">
      <BrowserFrame url="acme.com/pricing" footer={<span className="text-fg-muted">Updated today</span>}>
        <div className="grid h-full place-content-center gap-2 p-6 text-center">
          <p className="type-heading-3">Plans for every team</p>
          <p className="type-ui text-fg-soft">Start free, upgrade when you need more.</p>
        </div>
      </BrowserFrame>
    </div>
  )
}
