import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { settingsContent, type SettingsContent } from '@/lib/pages/settings'
import '@/elements/components/ui/button'
import '@/elements/components/ui/field'
import '@/elements/components/ui/input'
import '@/elements/components/ui/switch'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'

// SettingsPage.tsx as <spyglass-settings-page>: the rail, the profile fields and notification switches on cards, and
// the save button. `content` replaces the copy; the form posts to `action`.
const LINK = 'flex h-control-xs items-center rounded-control px-3 type-ui text-fg-soft transition-[color,background-color] duration-160 ease-out hover:bg-surface-raised hover:text-fg aria-[current=page]:bg-surface-raised aria-[current=page]:text-fg'

/**
 * @summary A settings page: profile fields and notification switches.
 */
export class SettingsPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="settings-page"]'))
	static properties = { content: { type: Object }, action: {} }
	/** The copy (lib/pages/settings.ts by default). */
	content: SettingsContent = settingsContent
	/** Where the form posts. */
	action?: string

	render() {
		const c = this.content ?? settingsContent
		return html`<div data-ds="settings-page" class="grid min-h-dvh bg-surface text-fg lg:grid-cols-[256px_minmax(0,1fr)]"><aside class="flex flex-col gap-6 border-b border-edge bg-surface-subtle p-4 lg:border-r lg:border-b-0"><a href="/" aria-label="Home" class="self-start rounded-control px-2 py-2"><spyglass-logo height="20"></spyglass-logo></a><nav aria-label="Settings"><ul role="list" class="m-0 flex list-none gap-1 overflow-x-auto p-0 max-lg:fade-x lg:flex-col">${c.nav.map((n) => html`<li class="shrink-0"><a href=${n.href} aria-current=${ifDefined(n.current ? 'page' : undefined)} class=${LINK}>${n.label}</a></li>`)}</ul></nav></aside><main class="grid max-w-200 content-start gap-8 p-6 lg:p-10"><h1 class="type-heading-2">${c.title}</h1><form action=${ifDefined(this.action)} method="post" class="grid gap-6"><section class="grid gap-5 rounded-container bg-surface-raised p-6"><h2 class="type-heading-3">${c.profile.title}</h2><spyglass-field label=${c.profile.name.label}><spyglass-input name="name" autocomplete="name" value=${c.profile.name.value}></spyglass-input></spyglass-field><spyglass-field label=${c.profile.email.label}><spyglass-input name="email" type="email" autocomplete="email" value=${c.profile.email.value}></spyglass-input></spyglass-field></section><section class="grid gap-5 rounded-container bg-surface-raised p-6"><h2 class="type-heading-3">${c.notifications.title}</h2><ul role="list" class="m-0 grid list-none gap-5 p-0">${c.notifications.items.map((n) => html`<li class="flex items-start justify-between gap-6"><span class="grid gap-1"><span class="type-ui-strong text-fg">${n.label}</span><span class="type-ui text-fg-muted">${n.description}</span></span><spyglass-switch label=${n.label} ?checked=${n.on}></spyglass-switch></li>`)}</ul></section><spyglass-button type="submit" class="justify-self-start">${c.save}</spyglass-button></form></main></div>`
	}
}

define('settings-page', SettingsPage)
