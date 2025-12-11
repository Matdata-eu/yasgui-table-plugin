/**
 * Table Data Types
 */

import { SparqlBinding } from './sparql';
import { ColumnDefinition } from './tabulator';

export interface TableRow {
  _id: string; // Unique row identifier
  _rowNum: number; // Row number (1-based)
  _selected?: boolean; // Selection state
  [varName: string]: string | number | boolean | SparqlBinding | undefined;
}

export interface TableColumn extends ColumnDefinition {
  field: string;
  title: string;
  width?: number;
  sorter?: string;
  formatter?: (cell: unknown) => string | HTMLElement;
  headerSort?: boolean;
  resizable?: boolean;
  frozen?: boolean;
}

export interface SelectionRange {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
  cells: Array<{ row: number; col: number; value: string }>;
}
