/**
 * Cell Selection Feature
 * Manages cell and row selection in the table
 */

import { Tabulator, CellComponent, RowComponent } from '../types/tabulator.js';
import { SelectionRange } from '../types/table.js';

export class CellSelection {
  private table: Tabulator;
  private selectedCells: Set<CellComponent> = new Set();
  private selectionStart: CellComponent | null = null;
  private onSelectionChange?: (range: SelectionRange | null) => void;

  constructor(table: Tabulator, onSelectionChange?: (range: SelectionRange | null) => void) {
    this.table = table;
    this.onSelectionChange = onSelectionChange;
    this.attachListeners();
  }

  private attachListeners(): void {
    // Cell click for single selection
    this.table.on('cellClick', (_e: never, cell: CellComponent) => {
      const field = cell.getField();
      if (field === '_rowNum') {
        // Row number clicked - select entire row
        this.selectRow(cell.getRow());
      } else {
        // Regular cell clicked
        this.selectCell(cell, false);
      }
    });

    // Clear selection on table area click (outside cells)
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tabulator-cell')) {
        this.clearSelection();
      }
    });
  }

  /**
   * Select a single cell
   */
  selectCell(cell: CellComponent, extend: boolean = false): void {
    if (!extend) {
      this.clearSelection();
    }

    this.selectedCells.add(cell);
    this.selectionStart = cell;
    this.applyCellStyle(cell, true);
    this.notifySelectionChange();
  }

  /**
   * Select an entire row
   */
  selectRow(row: RowComponent): void {
    this.clearSelection();
    const cells = row.getCells();
    
    for (const cell of cells) {
      const field = cell.getField();
      if (field !== '_rowNum') {
        this.selectedCells.add(cell);
        this.applyCellStyle(cell, true);
      }
    }
    
    this.notifySelectionChange();
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    for (const cell of this.selectedCells) {
      this.applyCellStyle(cell, false);
    }
    this.selectedCells.clear();
    this.selectionStart = null;
    this.notifySelectionChange();
  }

  /**
   * Get current selection as tab-separated values
   */
  getSelectionAsText(): string {
    if (this.selectedCells.size === 0) {
      return '';
    }

    // Group cells by row
    const rowMap = new Map<RowComponent, CellComponent[]>();
    for (const cell of this.selectedCells) {
      const row = cell.getRow();
      if (!rowMap.has(row)) {
        rowMap.set(row, []);
      }
      rowMap.get(row)!.push(cell);
    }

    // Build TSV output
    const rows: string[] = [];
    for (const [_row, cells] of rowMap) {
      const values = cells.map((cell) => {
        const value = cell.getValue();
        if (value && typeof value === 'object' && 'value' in value) {
          return (value as { value: string }).value || '';
        }
        return String(value || '');
      });
      rows.push(values.join('\t'));
    }

    return rows.join('\n');
  }

  /**
   * Get selection range
   */
  getSelectionRange(): SelectionRange | null {
    if (this.selectedCells.size === 0) {
      return null;
    }

    const cells = Array.from(this.selectedCells);
    const firstCell = cells[0];
    const lastCell = cells[cells.length - 1];

    // Get column indices from table columns
    const columns = this.table.getColumns();
    const startColIndex = columns.findIndex((col: never) => (col as { getField: () => string }).getField() === firstCell.getField());
    const endColIndex = columns.findIndex((col: never) => (col as { getField: () => string }).getField() === lastCell.getField());

    return {
      startRow: firstCell.getRow().getPosition(),
      startColumn: startColIndex,
      endRow: lastCell.getRow().getPosition(),
      endColumn: endColIndex,
      cells: cells.map(cell => ({
        row: cell.getRow().getPosition(),
        col: columns.findIndex((col: never) => (col as { getField: () => string }).getField() === cell.getField()),
        value: String(cell.getValue() || ''),
      })),
    };
  }

  /**
   * Apply or remove selection styling
   */
  private applyCellStyle(cell: CellComponent, selected: boolean): void {
    const element = cell.getElement();
    if (selected) {
      element.classList.add('table-cell-selected');
    } else {
      element.classList.remove('table-cell-selected');
    }
  }

  /**
   * Notify selection change
   */
  private notifySelectionChange(): void {
    if (this.onSelectionChange) {
      this.onSelectionChange(this.getSelectionRange());
    }
  }

  /**
   * Check if there is a selection
   */
  hasSelection(): boolean {
    return this.selectedCells.size > 0;
  }
}
