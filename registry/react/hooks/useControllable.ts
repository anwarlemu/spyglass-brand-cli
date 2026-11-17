'use client'
import { useCallback, useRef, useState } from 'react'

// Vue's defineModel in React: a value that is controlled when the caller passes it (value + onValueChange, as Radix
// does) and kept inside otherwise (defaultValue). setValue calls onChange either way.
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
	const [inner, setInner] = useState<T>(defaultValue)
	const controlled = value !== undefined
	const current = controlled ? value : inner
	const ref = useRef(onChange)
	ref.current = onChange
	const set = useCallback((next: T) => {
		if (!controlled) setInner(next)
		ref.current?.(next)
	}, [controlled])
	return [current, set] as const
}
