export type DataColumn = { key: string, label: string, align?: 'left' | 'right', sortable?: boolean, muted?: boolean }
export type DataRow = Record<string, unknown>
export type DataFilter = { key: string, label: string, options: string[], any?: string }
export type DataCell = (slot: { row: DataRow, value: unknown }) => unknown
/**
 * <spyglass-data-table>
 * @slot empty In place of the line shown when nothing matches the filters.
 */
export declare class DataTable extends HTMLElement {
  columns: DataColumn[];
  rows: DataRow[];
  rowKey: string;
  label: string;
  filters: DataFilter[];
  pageSize: number;
  cells: Partial<Record<string, DataCell>>;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-data-table': DataTable;
  }
}
