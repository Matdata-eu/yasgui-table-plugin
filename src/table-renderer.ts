/**
 * Table Renderer
 * Core table rendering logic using Tabulator
 */

import { TabulatorFull as Tabulator, ColumnDefinition } from 'tabulator-tables';
import { SparqlResults, SparqlBinding } from './types/sparql.js';
import { TabulatorPluginConfig, ColumnWidthMap } from './types/config.js';
import { parseResults } from './parsers/bindings-parser.js';
import { PrefixResolver } from './parsers/prefix-resolver.js';
import { UriFormatter } from './formatters/uri-formatter.js';
import { LiteralFormatter } from './formatters/literal-formatter.js';
import { BnodeFormatter } from './formatters/bnode-formatter.js';
import { EllipsisFormatter } from './formatters/ellipsis-formatter.js';
import { getVirtualScrollConfig } from './features/virtual-scroll.js';
import { ColumnResize } from './features/column-resize.js';
import { containsSearchTerm } from './features/search-highlight.js';

export class TableRenderer {
  private config: TabulatorPluginConfig;
  private prefixResolver: PrefixResolver;
  private uriFormatter: UriFormatter;
  private literalFormatter: LiteralFormatter;
  private bnodeFormatter: BnodeFormatter;
  private ellipsisFormatter: EllipsisFormatter;
  private _columnResize: ColumnResize | null = null;
  private table: Tabulator | null = null;
  private currentSearchTerm: string = '';
  private currentLayout: 'fitData' | 'fitColumns' = 'fitData';
  private onWidthChange?: (widths: ColumnWidthMap) => void;
  private onSortChange?: (column: string, dir: 'asc' | 'desc') => void;

  constructor(
    config: TabulatorPluginConfig,
    onWidthChange?: (widths: ColumnWidthMap) => void,
    onSortChange?: (column: string, dir: 'asc' | 'desc') => void
  ) {
    this.config = config;
    this.prefixResolver = new PrefixResolver(config.prefixMap);
    this.onWidthChange = onWidthChange;
    this.onSortChange = onSortChange;

    // Initialize formatters
    const displayConfig = config.displayConfig || {};
    this.uriFormatter = new UriFormatter(
      this.prefixResolver,
      displayConfig.uriDisplayMode || 'full'
    );
    this.literalFormatter = new LiteralFormatter(displayConfig.showDatatypes || false);
    this.bnodeFormatter = new BnodeFormatter();
    this.ellipsisFormatter = new EllipsisFormatter(displayConfig.ellipsisMode || false);
  }

  /**
   * Render SPARQL results as table
   */
  render(container: HTMLElement, results: SparqlResults): Tabulator {
    // Parse results
    const tableData = parseResults(results);

    // Generate columns
    const columns = this.generateColumns(results.head.vars);

    // Get virtual scroll config
    const virtualScrollConfig = getVirtualScrollConfig(tableData.length);

    // Apply saved column widths if available
    const displayConfig = this.config.displayConfig || {};
    if (displayConfig.columnWidths) {
      for (const col of columns) {
        const field = col.field;
        if (field && displayConfig.columnWidths[field]) {
          col.width = displayConfig.columnWidths[field];
        }
      }
    }

    // Initialize Tabulator
    this.table = new Tabulator(container, {
      data: tableData,
      columns: columns,
      layout: 'fitData',
      ...virtualScrollConfig,
      placeholder: 'No results',
      initialSort: displayConfig.sortState
        ? [
            {
              column: displayConfig.sortState.column,
              dir: displayConfig.sortState.dir,
            },
          ]
        : [],
      ...this.config.tabulatorOptions,
    });

    // Setup column resize tracking
    if (this.onWidthChange) {
      this._columnResize = new ColumnResize(this.table, this.onWidthChange);
    }

    // Setup sort change tracking
    if (this.onSortChange) {
      this.table.on('dataSorted', (sorters: Array<{ field: string; dir: 'asc' | 'desc' }>) => {
        if (sorters.length > 0 && this.onSortChange) {
          this.onSortChange(sorters[0].field, sorters[0].dir);
        }
      });
    }

    return this.table;
  }

  /**
   * Generate column definitions from SPARQL variables
   */
  private generateColumns(vars: string[]): ColumnDefinition[] {
    const columns: ColumnDefinition[] = [];

    // Row number column (frozen)
    columns.push({
      title: '#',
      field: '_rowNum',
      width: 60,
      frozen: true,
      headerSort: false,
      resizable: false,
      hozAlign: 'center',
      formatter: (cell: never) => (cell as { getValue: () => unknown }).getValue() as string,
    });

    // Data columns
    for (const varName of vars) {
      columns.push({
        title: varName,
        field: varName,
        headerSort: true,
        resizable: true,
        sorter: this.getColumnSorter(),
        formatter: (cell: never) => this.formatCell(cell),
        minWidth: 50,
      });
    }

    return columns;
  }

  /**
   * Format cell based on binding type
   */
  private formatCell(cell: unknown): string | HTMLElement {
    const binding = (cell as { getValue: () => unknown }).getValue() as
      | SparqlBinding
      | undefined;

    if (!binding) {
      return '';
    }

    let result: string | HTMLElement;
    switch (binding.type) {
      case 'uri':
        result = this.uriFormatter.format(cell as never);
        break;
      case 'literal':
        result = this.literalFormatter.format(cell as never);
        break;
      case 'bnode':
        result = this.bnodeFormatter.format(cell as never);
        break;
      default:
        result = binding.value || '';
    }

    // Get full text for tooltip
    const fullText = this.getFullTextContent(result, binding);

    // Apply ellipsis formatting if enabled
    if (this.ellipsisFormatter.isEnabled()) {
      if (typeof result === 'string') {
        const formatted = this.ellipsisFormatter.format(result);
        return formatted.isTruncated ? this.createEllipsisElement(fullText, formatted.display) : this.addTooltip(result, fullText);
      } else if (result instanceof HTMLElement) {
        const textContent = result.textContent || '';
        const formatted = this.ellipsisFormatter.format(textContent);
        if (formatted.isTruncated) {
          return this.createEllipsisElement(fullText, formatted.display);
        }
        // Ensure tooltip is on the element
        if (!result.title) {
          result.title = fullText;
        }
        return result;
      }
    }

    // Add tooltip even when ellipsis is disabled
    if (typeof result === 'string') {
      return this.addTooltip(result, fullText);
    } else if (result instanceof HTMLElement && !result.title) {
      result.title = fullText;
    }

    return result;
  }

  /**
   * Get the full text content for tooltip
   */
  private getFullTextContent(result: string | HTMLElement, binding: SparqlBinding): string {
    if (binding.type === 'literal') {
      let text = binding.value;
      if (binding['xml:lang']) {
        text += ` @${binding['xml:lang']}`;
      }
      if (binding.datatype) {
        text += ` ^^${binding.datatype}`;
      }
      return text;
    }
    
    if (typeof result === 'string') {
      return result;
    }
    
    return result.textContent || binding.value || '';
  }

  /**
   * Add tooltip to string content
   */
  private addTooltip(content: string, tooltip: string): HTMLElement {
    const span = document.createElement('span');
    span.textContent = content;
    span.title = tooltip;
    return span;
  }

  /**
   * Create an element with ellipsis and full text on hover
   */
  private createEllipsisElement(fullText: string, truncatedText: string): HTMLElement {
    const span = document.createElement('span');
    span.textContent = truncatedText;
    span.title = fullText;
    span.className = 'table-ellipsis-content';
    return span;
  }

  /**
   * Get sorter function for SPARQL bindings
   */
  private getColumnSorter() {
    return (
      a: SparqlBinding | undefined,
      b: SparqlBinding | undefined,
      _aRow: unknown,
      _bRow: unknown,
      _column: unknown,
      _dir: string
    ): number => {
      const aVal = a?.value || '';
      const bVal = b?.value || '';

      // Try numeric comparison first
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }

      // Fallback to string comparison
      return aVal.localeCompare(bVal);
    };
  }

  /**
   * Update formatters with new display config
   */
  updateDisplayConfig(config: TabulatorPluginConfig): void {
    const displayConfig = config.displayConfig || {};

    if (displayConfig.uriDisplayMode) {
      this.uriFormatter.setDisplayMode(displayConfig.uriDisplayMode);
    }

    if (displayConfig.showDatatypes !== undefined) {
      this.literalFormatter.setShowDatatypes(displayConfig.showDatatypes);
    }

    if (displayConfig.ellipsisMode !== undefined) {
      this.ellipsisFormatter.setEnabled(displayConfig.ellipsisMode);
    }
  }

  /**
   * Apply search filter to table
   * @param searchTerm Search term to filter by (case-insensitive)
   * @returns Number of rows matching the filter
   */
  applySearchFilter(searchTerm: string): number {
    this.currentSearchTerm = searchTerm;

    if (!this.table) {
      return 0;
    }

    if (!searchTerm || searchTerm.trim() === '') {
      // Clear filter
      this.table.clearFilter();
      return this.table.getData().length;
    }

    // Apply case-insensitive filter across all columns
    const trimmedTerm = searchTerm.trim();
    this.table.setFilter((data: Record<string, unknown>) => {
      // Search across all columns except _id and _rowNum
      for (const key of Object.keys(data)) {
        if (key === '_id' || key === '_rowNum') {
          continue;
        }

        const value = data[key];
        if (value && typeof value === 'object' && 'value' in value) {
          // SPARQL binding object
          const binding = value as SparqlBinding;
          if (containsSearchTerm(binding.value || '', trimmedTerm)) {
            return true;
          }
          // Also check language tag for literals
          if (binding.type === 'literal' && binding['xml:lang']) {
            if (containsSearchTerm(binding['xml:lang'], trimmedTerm)) {
              return true;
            }
          }
        }
      }
      return false;
    });

    // Get filtered data count
    const filteredData = this.table.getData('active');
    return filteredData.length;
  }

  /**
   * Get the current search term
   */
  getCurrentSearchTerm(): string {
    return this.currentSearchTerm;
  }

  /**
   * Get total row count
   */
  getTotalRowCount(): number {
    if (!this.table) {
      return 0;
    }
    return this.table.getData().length;
  }

  /**
   * Get filtered row count (visible rows after search)
   */
  getFilteredRowCount(): number {
    if (!this.table) {
      return 0;
    }
    return this.table.getData('active').length;
  }

  /**
   * Change table layout mode
   */
  setLayout(mode: 'fitData' | 'fitColumns'): void {
    if (!this.table) {
      return;
    }
    
    // Store current state
    const currentData = this.table.getData();
    const currentColumns = this.table.getColumns().map(col => col.getDefinition());
    const container = this.table.element;
    
    // Check if container is valid
    if (!container) {
      console.error('Table container element is null');
      return;
    }
    
    // Get virtual scroll config
    const virtualScrollConfig = getVirtualScrollConfig(currentData.length);
    
    // Get display config
    const displayConfig = this.config.displayConfig || {};
    
    // Destroy old table
    this.table.destroy();
    
    // Create new table with new layout
    this.table = new Tabulator(container, {
      data: currentData,
      columns: currentColumns,
      layout: mode,
      ...virtualScrollConfig,
      placeholder: 'No results',
      initialSort: displayConfig.sortState
        ? [
            {
              column: displayConfig.sortState.column,
              dir: displayConfig.sortState.dir,
            },
          ]
        : [],
      ...this.config.tabulatorOptions,
    });
    
    // Re-setup column resize tracking
    if (this.onWidthChange) {
      this._columnResize = new ColumnResize(this.table, this.onWidthChange);
    }
    
    // Re-setup sort change tracking
    if (this.onSortChange) {
      this.table.on('dataSorted', (sorters: Array<{ field: string; dir: 'asc' | 'desc' }>) => {
        if (sorters.length > 0 && this.onSortChange) {
          this.onSortChange(sorters[0].field, sorters[0].dir);
        }
      });
    }
    
    // Re-apply search filter if one was active
    if (this.currentSearchTerm) {
      this.applySearchFilter(this.currentSearchTerm);
    }
    
    this.currentLayout = mode;
  }
}
