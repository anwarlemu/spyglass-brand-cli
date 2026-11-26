export type SettingsContent = { nav: ({ label: string; href: string; current: boolean; } | { label: string; href: string; current?: undefined; })[]; title: string; profile: { title: string; name: { label: string; value: string; }; email: { label: string; value: string; }; }; notifications: { title: string; items: { label: string; description: string; on: boolean; }[]; }; save: string; }
export type SettingsSection = "profile" | "notifications" | "save"
/**
 * <spyglass-settings-page>

 */
export declare class SettingsPage extends HTMLElement {
  content: { nav: ({ label: string; href: string; current: boolean; } | { label: string; href: string; current?: undefined; })[]; title: string; profile: { title: string; name: { label: string; value: string; }; email: { label: string; value: string; }; }; notifications: { title: string; items: { label: string; description: string; on: boolean; }[]; }; save: string; };
  action?: string | undefined;
  sections?: ("profile" | "notifications" | "save")[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-settings-page': SettingsPage;
  }
}
