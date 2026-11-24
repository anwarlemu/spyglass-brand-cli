// The templates wall's copy and the templates page's copy (site content/v2/templates.ts, content/home.ts templates,
// content/pages/templates.ts and templatesCities.ts), with Acme's material: the names are the templates' own kinds,
// never a platform's product. Both flavors read this file.

export interface TemplatesWallContent {
	/** The line over the rolling chip. */
	headline: string
	/** The names the chip rolls through, one per step. */
	names: string[]
	lead: string
	/** The quiet line under the lead (the site's "Coming soon"). */
	status: string
}

export const templatesWallContent: TemplatesWallContent = {
	headline: 'Build your own',
	names: ['Ad library', 'Creator sourcing tool', 'Competitor monitor', 'Trend tracker'],
	lead: 'Ready-made playbooks that run inside your agent on Spyglass data.',
	status: 'Coming soon',
}
