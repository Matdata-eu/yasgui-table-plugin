/**
 * Column Resize Feature
 * Handles column width adjustments and persistence
 */

import { Tabulator } from '../types/tabulator.js';
import { ColumnWidthMap } from '../types/config.js';

export class ColumnResize {
  private table: Tabulator;
  private onWidthChange?: (widths: ColumnWidthMap) => void;

  constructor(table: Tabulator, onWidthChange?: (widths: ColumnWidthMap) => void) {
    this.table = table;
    this.onWidthChange = onWidthChange;
    this.attachListeners();
  }

  /**
   * Attach column resize listeners
   */
  private attachListeners(): void {
    this.table.on('columnResized', (column: { getField: () => string; getWidth: () => number }) => {
      const field = column.getField();
      const width = column.getWidth();

      // Emit width change event
      if (this.onWidthChange) {
        const widths = this.getCurrentWidths();
        this.onWidthChange(widths);
      }

      // Emit external event
      this.emitEvent('columnResize', {
        column: field,
        width: width,
      });
    });
  }

  /**
   * Get current column widths
   */
  getCurrentWidths(): ColumnWidthMap {
    const widths: ColumnWidthMap = {};
    const columns = this.table.getColumns();

    for (const column of columns) {
      const field = (column as { getField: () => string }).getField();
      const width = (column as { getWidth: () => number }).getWidth();

      // Skip row number column
      if (field !== '_rowNum') {
        widths[field] = width;
      }
    }

    return widths;
  }

  /**
   * Apply column widths
   */
  applyWidths(widths: ColumnWidthMap): void {
    for (const [field, width] of Object.entries(widths)) {
      const column = this.table.getColumn(field);
      if (column) {
        (column as { setWidth: (width: number) => void }).setWidth(width);
      }
    }
  }

  /**
   * Emit custom event
   */
  private emitEvent(name: string, data: unknown): void {
    const event = new CustomEvent(`yasgui-table-${name}`, {
      detail: data,
      bubbles: true,
    });
    this.table.element.dispatchEvent(event);
  }
}
