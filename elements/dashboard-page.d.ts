export type DashboardContent = { nav: ({ label: string; href: string; current: boolean; } | { label: string; href: string; current?: undefined; })[]; title: string; action: { label: string; href: string; }; stats: { label: string; value: string; }[]; tableTitle: string; columns: string[]; rows: string[][]; }
export type DashboardSection = "head" | "stats" | "table"
/**
 * <spyglass-dashboard-page>

 */
export declare class DashboardPage extends HTMLElement {
  content: { nav: ({ label: string; href: string; current: boolean; } | { label: string; href: string; current?: undefined; })[]; title: string; action: { label: string; href: string; }; stats: { label: string; value: string; }[]; tableTitle: string; columns: string[]; rows: string[][]; };
  sections?: ("head" | "stats" | "table")[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-dashboard-page': DashboardPage;
  }
}
