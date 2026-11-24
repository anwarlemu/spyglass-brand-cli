// The home hero (site v3/V3Playground in its hero form, HeroPrompt, content/home heroBrief and content/v3/hero-ask),
// framework-free: the copy and the prompt's typing. The prompt types example questions into its field at the hero
// reference's rhythm (60 frames a second: a few frames a character, a 2.5s hold, a quick erase), one after another,
// while it is on screen; a mouse over the card or focus in the field holds the whole question; reduced motion shows it
// whole. The clients under it are plain names (their marks come through `src`); the questions are Acme placeholders.

export interface HeroClient {
	name: string
	/** Opens this link (a client's connector page). */
	href?: string
	/** Or copies this text (an MCP or API URL). */
	copy?: string
	/** What the status line says once copied. */
	copied?: string
	/** The client's mark (an SVG, drawn in the text color at 16px); the code glyph without one. */
	src?: string
}

export interface HeroContent {
	headline: string
	lead: string
	secondary: { label: string; href: string }
	note: string
	prompt: { label: string; send: string; action: string; questions: string[]; worksLabel: string; copied: string; clients: HeroClient[] }
}

export const heroContent: HeroContent = {
	headline: 'One MCP for the entire social internet',
	lead: 'Every ad library and social channel, indexed and analyzed, ready for your agents. Connect our MCP or API in minutes.',
	secondary: { label: 'Get a free API key', href: '/sign-up' },
	note: '500 free credits every month. No card required.',
	prompt: {
		label: 'Ask Acme',
		send: 'Get a free API key',
		action: '/sign-up',
		questions: ['Show me the longest-running Meta ads in running shoes.', 'Which skincare posts broke out on TikTok this month?', 'What hooks has Acme Fit leaned on in the last 30 days?', 'Which of Acme Drinks’ Instagram posts got the most views?'],
		worksLabel: 'Works where you work',
		copied: 'Copied',
		clients: [
			{ name: 'Acme Chat', href: '#' },
			{ name: 'Acme Code', href: '#' },
			{ name: 'Acme Editor', href: '#' },
			{ name: 'any MCP client', copy: 'https://mcp.acme.com/mcp', copied: 'MCP URL copied' },
			{ name: 'REST', copy: 'https://api.acme.com', copied: 'API URL copied' },
		],
	},
}

const FRAME = 1000 / 60
const HOLD = 150 * FRAME
const GAP = 24 * FRAME
const OUT = 3 * FRAME
const DELETE_STEP = 1.25
const TYPE_STEPS = [3, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 2, 3]

export interface Typing { hold: () => void; release: () => void; cleanup: () => void }

/** Types the ghost's [data-ch] characters in, holds, erases them, then calls `next`. */
export function writeInto(ghost: HTMLElement, held: boolean, next: () => void): Typing {
	const chars = Array.from(ghost.querySelectorAll<HTMLElement>('[data-ch]'))
	let k = 0
	let phase: 'type' | 'hold' | 'erase' = 'type'
	let timer = 0
	let seen = false
	let paused = held
	const outs = new Set<number>()
	const whole = () => {
		window.clearTimeout(timer)
		outs.forEach((t) => window.clearTimeout(t))
		outs.clear()
		chars.forEach((c) => {
			c.setAttribute('data-on', '')
			c.removeAttribute('data-out')
		})
		k = chars.length
		phase = 'hold'
	}
	const step = () => {
		if (phase === 'type') {
			chars[k]?.setAttribute('data-on', '')
			k += 1
			if (k >= chars.length) {
				phase = 'hold'
				timer = window.setTimeout(step, HOLD)
			} else timer = window.setTimeout(step, TYPE_STEPS[(k - 1) % TYPE_STEPS.length] * FRAME)
			return
		}
		if (phase === 'hold') phase = 'erase'
		k -= 1
		const c = chars[k]
		if (c) {
			c.setAttribute('data-out', '')
			const t = window.setTimeout(() => {
				outs.delete(t)
				c.removeAttribute('data-on')
				c.removeAttribute('data-out')
			}, OUT)
			outs.add(t)
		}
		if (k > 0) timer = window.setTimeout(step, DELETE_STEP * FRAME)
		else timer = window.setTimeout(next, GAP)
	}
	const run = () => {
		window.clearTimeout(timer)
		if (!seen || document.hidden || paused) return
		if (phase === 'hold') timer = window.setTimeout(step, HOLD)
		else timer = window.setTimeout(step, phase === 'type' ? TYPE_STEPS[0] * FRAME : DELETE_STEP * FRAME)
	}
	ghost.setAttribute('data-typing', '')
	chars.forEach((c) => c.removeAttribute('data-on'))
	if (held) whole()
	const view = new IntersectionObserver(([entry]) => {
		seen = entry.isIntersecting
		run()
	})
	view.observe(ghost)
	document.addEventListener('visibilitychange', run)
	return {
		hold: () => {
			paused = true
			whole()
		},
		release: () => {
			paused = false
			run()
		},
		cleanup: () => {
			window.clearTimeout(timer)
			outs.forEach((t) => window.clearTimeout(t))
			view.disconnect()
			document.removeEventListener('visibilitychange', run)
		},
	}
}
