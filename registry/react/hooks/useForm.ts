'use client'
import { useCallback, useRef, useState } from 'react'

/** A rule for one field: the message to show when the value is wrong, or nothing when it is right. */
export type Rule<V extends Record<string, unknown>> = (value: V[keyof V], values: V) => string | undefined

/**
 * A form's values, its errors and its submit (the Form item). An error shows once its field has been left or the form
 * submitted, never while the first value is still being typed; after that it updates as the value changes. `submit`
 * checks every rule and runs `send` only when all pass, holding `sending` while it runs; a thrown Error's message
 * becomes the form's `failure`. `values` is read with `set(key, value)` to write one.
 */
export function useForm<V extends Record<string, unknown>>(initial: V, rules: Partial<Record<keyof V, Rule<V>>>) {
  const [values, setValues] = useState<V>({ ...initial })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const [failure, setFailure] = useState('')
  // The latest values and sending, for a submit called from a stale closure.
  const latest = useRef(values)
  latest.current = values
  const busy = useRef(false)
  const first = useRef(initial)
  const rulesRef = useRef(rules)
  rulesRef.current = rules

  const check = (v: V) => {
    const out: Partial<Record<keyof V, string>> = {}
    for (const key of Object.keys(rulesRef.current) as Array<keyof V>) {
      const message = rulesRef.current[key]?.(v[key], v)
      if (message) out[key] = message
    }
    return out
  }
  const all = check(values)
  /** The errors to show now. */
  const errors: Partial<Record<keyof V, string>> = {}
  for (const key of Object.keys(all) as Array<keyof V>) if (tried || touched[String(key)]) errors[key] = all[key]
  const valid = Object.keys(all).length === 0

  const set = useCallback(<K extends keyof V>(key: K, value: V[K]) => {
    setValues(v => ({ ...v, [key]: value }))
  }, [])
  const touch = useCallback((key: keyof V) => {
    setTouched(t => ({ ...t, [String(key)]: true }))
  }, [])
  const submit = useCallback(async (send: (values: V) => Promise<void> | void) => {
    setTried(true)
    setFailure('')
    if (Object.keys(check(latest.current)).length || busy.current) return false
    busy.current = true
    setSending(true)
    try {
      await send(latest.current)
      return true
    }
    catch (error) {
      setFailure(error instanceof Error ? error.message : 'Something went wrong. Try again.')
      return false
    }
    finally {
      busy.current = false
      setSending(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const reset = useCallback(() => {
    setValues({ ...first.current })
    setTouched({})
    setTried(false)
    setFailure('')
  }, [])

  return { values, set, errors, valid, sending, failure, touch, submit, reset }
}
