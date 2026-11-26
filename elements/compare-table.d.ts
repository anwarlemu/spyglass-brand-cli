export interface ComparePlan { key: string; name: string }
export interface CompareGroup { title: string; rows: CompareRow[] }
export interface CompareRow { label: string; tip?: string; href?: string; soon?: boolean; cells: CompareCell[] }
export type CompareCell = true | '' | string
/**
 * <spyglass-compare-table>

 */
export declare class CompareTable extends HTMLElement {
  plans: ComparePlan[];
  groups: CompareGroup[];
  defaultPlan?: string | undefined;
  labels?: Partial<{ soon: string; included: string; notIncluded: string; pick: string; }> | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-compare-table': CompareTable;
  }
}
