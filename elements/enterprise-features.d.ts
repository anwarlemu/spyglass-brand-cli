export type EnterpriseFeaturesContent = { headline: string; data: { title: string; line: string; tools: { name: string; mark?: string | undefined; label?: string | undefined; }[]; question: string; answer: string; summary: string; }; archive: { title: string; line: string; live: string; source: string; scope: string; records: { brand: string; meta: string; status: string; picked?: boolean | undefined; live?: boolean | undefined; shot: FeatureShot; }[]; draft: string; app: string; stat: { value: string; label: string; }; summary: string; }; agents: { title: string; line: string; clients: { name: string; mark?: string | undefined; label?: string | undefined; }[]; hub: string; summary: string; }; engineers: { title: string; line: string; you: string; us: string; steps: [string, string, string]; summary: string; }; builds: { title: string; line: string; dashboard: { tab: string; caption: string; rows: { label: string; value: number; }[]; }; creators: { tab: string; caption: string; tool: { name: string; mark?: string | undefined; label?: string | undefined; }; rows: { name: string; note: string; avatar?: string | undefined; }[]; }; hooks: { tab: string; review: string; source: string; hook: string; rivals: string; ads: FeatureShot[]; }; summary: string; }; tools: { title: string; line: string; request: string; name: string; metric: string; options: { label: string; value: string; rows: number; }[]; tag: string[]; summary: string; }; reports: { title: string; line: string; messages: { text: string; channel: string; ads: [FeatureShot & { tag: string; }, FeatureShot & { tag: string; }]; }[]; summary: string; }; alpha: { title: string; line: string; workspace: string; shots: FeatureShot[]; ask: string; answer: string; product: string; answering: string; deleted: string; summary: string; }; }
export interface FeatureShot extends ImageSlot { tone?: 1 | 2 | 3 | 4; crop?: string }
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
/**
 * <spyglass-enterprise-features>

 */
export declare class EnterpriseFeatures extends HTMLElement {
  content: { headline: string; data: { title: string; line: string; tools: { name: string; mark?: string; label?: string; }[]; question: string; answer: string; summary: string; }; archive: { title: string; line: string; live: string; source: string; scope: string; records: { brand: string; meta: string; status: string; picked?: boolean; live?: boolean; shot: FeatureShot; }[]; draft: string; app: string; stat: { value: string; label: string; }; summary: string; }; agents: { title: string; line: string; clients: { name: string; mark?: string; label?: string; }[]; hub: string; summary: string; }; engineers: { title: string; line: string; you: string; us: string; steps: [string, string, string]; summary: string; }; builds: { title: string; line: string; dashboard: { tab: string; caption: string; rows: { label: string; value: number; }[]; }; creators: { tab: string; caption: string; tool: { name: string; mark?: string; label?: string; }; rows: { name: string; note: string; avatar?: string; }[]; }; hooks: { tab: string; review: string; source: string; hook: string; rivals: string; ads: FeatureShot[]; }; summary: string; }; tools: { title: string; line: string; request: string; name: string; metric: string; options: { label: string; value: string; rows: number; }[]; tag: string[]; summary: string; }; reports: { title: string; line: string; messages: { text: string; channel: string; ads: [FeatureShot & { tag: string; }, FeatureShot & { tag: string; }]; }[]; summary: string; }; alpha: { title: string; line: string; workspace: string; shots: FeatureShot[]; ask: string; answer: string; product: string; answering: string; deleted: string; summary: string; }; };
  sectionId: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-enterprise-features': EnterpriseFeatures;
  }
}
