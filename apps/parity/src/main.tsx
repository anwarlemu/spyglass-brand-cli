import './main.css'
import { createRoot } from 'react-dom/client'
import { useEffect, useRef, type ComponentType } from 'react'

// One example alone: /react/<item>/<Example> renders the React example (the reference), /elements/<item>/<Example>
// the element example (its markup from /r/<item>.json, its modules imported first, its inline scripts run). The frame
// is the docs site's preview frame: bg-surface, centered with px-8 py-10 when the docs list the example as `center`,
// else p-8.
interface Example { name: string, label: string, center: boolean, half: boolean }
interface ElementsFlavor { modules: string[], examples: Array<{ name: string, content: string }> }

const reactExamples = import.meta.glob('@/react/examples/*/*.tsx') as Record<string, () => Promise<{ default: ComponentType }>>

function Frame({ center, children }: { center: boolean, children: React.ReactNode }) {
  return (
    <div className={center ? 'bg-surface flex items-center justify-center px-8 py-10' : 'bg-surface p-8'}>
      <div className={center ? 'min-w-0 max-w-full' : 'min-w-0 max-w-full w-full'}>{children}</div>
    </div>
  )
}

function ElementExample({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    host.innerHTML = html
    // innerHTML does not run scripts: put each back as a new script element, in order.
    for (const old of host.querySelectorAll('script')) {
      const s = document.createElement('script')
      for (const a of old.attributes) s.setAttribute(a.name, a.value)
      s.textContent = old.textContent
      old.replaceWith(s)
    }
  }, [html])
  // display: contents, so the example's own nodes sit in the frame as the React example's do.
  return <div ref={ref} className="contents" />
}

async function boot() {
  const root = createRoot(document.getElementById('root')!)
  const [, flavor, item, name] = location.pathname.split('/')
  const fail = (msg: string) => {
    document.title = 'Not found'
    root.render(<p className="p-8 type-ui">{msg}</p>)
  }
  if (!item || !name || (flavor !== 'react' && flavor !== 'elements')) return fail('Open /react/<item>/<Example> or /elements/<item>/<Example>.')
  const res = await fetch(`/r/${item}.json`)
  if (!res.ok) return fail(`No item ${item}.`)
  const data = await res.json() as { title: string, examples: Example[], flavors?: { elements?: ElementsFlavor } }
  const example = data.examples.find(e => e.name === name)
  if (!example) return fail(`No example ${name} in ${item}.`)
  document.title = `${data.title}: ${example.label} (${flavor})`
  if (flavor === 'react') {
    const key = Object.keys(reactExamples).find(k => k.endsWith(`/react/examples/${item}/${name}.tsx`))
    if (!key) return fail(`${item} has no React example ${name}.`)
    const { default: Example } = await reactExamples[key]!()
    root.render(<Frame center={example.center}><Example /></Frame>)
  }
  else {
    const el = data.flavors?.elements
    const ex = el?.examples.find(e => e.name === name)
    if (!el || !ex) return fail(`${item} has no element example ${name}.`)
    await Promise.all(el.modules.map(m => import(/* @vite-ignore */ `/${m}`)))
    root.render(<Frame center={example.center}><ElementExample html={ex.content} /></Frame>)
  }
}

void boot()
