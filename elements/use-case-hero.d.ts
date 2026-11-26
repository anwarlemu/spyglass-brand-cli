export interface UseCaseHeroContent {
	/** The heading's id stem (the page's slug). */
	id: string
	name: string
	line: string
	/** Who it is for, under the actions ("For creative strategists..."; the period is added). */
	forWho: string
	primary: UseCaseAction
	secondary: UseCaseAction
	/** The visual's source note, for assistive tech. */
	source?: string
}
export interface UseCaseAction {
	label: string
	href: string
}
export interface ChatContent {
	server: string
	status: string
	composer: string
	/** The chat's name for assistive tech. */
	label: string
	/** The chips' group name. */
	chipsLabel: string
	turns: readonly ChatTurn[]
}
export interface ChatTurn {
	/** The chip that picks this question. */
	chip: string
	/** An @mention typed before the question. */
	mention?: string
	question: string
	/** "Worked for 3s". */
	status: string
	tool: string
	args: string
	lead: string
	columns: readonly [string, string]
	rows: ChatRow[]
	/** A post the answer leads with (a picture, a title and a detail) instead of a plain lead line. */
	post?: { picture: ChatPicture; title: string; detail: string }
}
export interface ChatRow {
	label: string
	detail: string
	value: string
	picture?: ChatPicture
}
export interface ChatPicture extends ImageSlot {
	alt: string
	/** Width over height (the strip on phones keeps it). */
	ratio?: number
	tone?: 1 | 2 | 3 | 4
}
export interface ImageSlot {
	/** The image. */
	src?: string
	/** What it shows; empty when it is decoration. */
	alt?: string
	/** How it fills its box (object-fit); cover by default. */
	fit?: ImageFit
	/** Where it is anchored in its box (object-position), for example "50% 20%" or "top". */
	position?: string
}
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
export interface BuildContent {
	url: string
	builtOn: string
	title: string
	meta: string
	call: { method: string; path: string; lines: { key: string; value: string | null }[] }
	tiles: BuildTile[]
	sorts: BuildSort[]
	/** What the visual shows, for assistive tech. */
	description: string
}
export interface BuildTile extends ImageSlot {
	id: string
	alt: string
	tone?: 1 | 2 | 3 | 4
	/** The badge for each sort key. */
	figure: Record<string, string>
}
export interface BuildSort {
	key: string
	label: string
	/** The request's sortBy value. */
	sortBy: string
	/** Tile ids in grid order. */
	order: string[]
}
/**
 * <spyglass-use-case-hero>
 * @slot control A control in the White button's place (a connect menu).
 */
export declare class UseCaseHero extends HTMLElement {
  content: UseCaseHeroContent;
  visual: "build" | "chat";
  chat: ChatContent;
  build: BuildContent;
  pair: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-use-case-hero': UseCaseHero;
  }
}
