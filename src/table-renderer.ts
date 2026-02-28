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
  private onCellDblClick?: (cell: { getValue: () => unknown }) => void;

  constructor(
    config: TabulatorPluginConfig,
    onWidthChange?: (widths: ColumnWidthMap) => void,
    onSortChange?: (column: string, dir: 'asc' | 'desc') => void,
    onCellDblClick?: (cell: { getValue: () => unknown }) => void
  ) {
    this.config = config;
    this.prefixResolver = new PrefixResolver(config.prefixMap);
    this.onWidthChange = onWidthChange;
    this.onSortChange = onSortChange;
    this.onCellDblClick = onCellDblClick;

    // Initialize formatters
    const displayConfig = config.displayConfig || {};
    this.uriFormatter = new UriFormatter(
      this.prefixResolver,
      displayConfig.uriDisplayMode || 'full',
      config.uriHrefAdapter
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
    let tableData = parseResults(results);

    // Apply bindingSetAdapter if provided
    if (this.config.bindingSetAdapter) {
      const adapter = this.config.bindingSetAdapter;
      tableData = tableData.map((row) => {
        const { _id, _rowNum, ...bindingSet } = row;
        const adapted = adapter(bindingSet as any);
        return { _id, _rowNum, ...adapted };
      });
    }

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

    // Setup cell double-click handler
    this.registerCellDblClick();

    return this.table;
  }

  /**
   * Register the cell double-click handler on the current table instance
   */
  private registerCellDblClick(): void {
    if (this.table && this.onCellDblClick) {
      this.table.on('cellDblClick', (_e: unknown, cell: { getValue: () => unknown }) => {
        this.onCellDblClick!(cell);
      });
    }
  }

  /**
   * Generate column definitions from SPARQL variables
   */
  private generateColumns(vars: string[]): ColumnDefinition[] {
    const columns: ColumnDefinition[] = [];
    const smartFormatters = this.config.displayConfig?.smartFormatters ?? true;

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
      const smartFormatter = smartFormatters ? this.getSmartFormatter(varName) : null;
      columns.push({
        title: varName,
        field: varName,
        headerSort: true,
        resizable: true,
        sorter: this.getColumnSorter(),
        formatter: smartFormatter
          ? (cell: never) => smartFormatter(cell)
          : (cell: never) => this.formatCell(cell),
        minWidth: 50,
      });
    }

    return columns;
  }

  /**
   * Detect a smart formatter function for a variable name based on naming conventions.
   * Returns null if no convention matches.
   */
  private getSmartFormatter(varName: string): ((cell: unknown) => string | HTMLElement) | null {
    const lower = varName.toLowerCase();
    if (lower.endsWith('stars')) return (cell) => this.formatStars(cell);
    if (lower.endsWith('percent')) return (cell) => this.formatProgress(cell);
    if (lower.endsWith('image')) return (cell) => this.formatImage(cell);
    if (lower.endsWith('color') || lower.endsWith('colour')) return (cell) => this.formatColor(cell);
    if (lower.endsWith('description')) return (cell) => this.formatDescription(cell);
    return null;
  }

  /**
   * Render a star rating (0–5) from a numeric literal binding.
   */
  private formatStars(cell: unknown): string | HTMLElement {
    const binding = (cell as { getValue: () => unknown }).getValue() as
      | { type: string; value: string }
      | undefined;
    if (!binding || binding.type !== 'literal') return this.formatCell(cell);
    const num = parseFloat(binding.value);
    if (isNaN(num)) return this.formatCell(cell);
    const total = 5;
    const filled = Math.max(0, Math.min(total, Math.round(num)));
    const span = document.createElement('span');
    span.className = 'table-stars';
    span.title = String(binding.value);
    span.textContent = '★'.repeat(filled) + '☆'.repeat(total - filled);
    return span;
  }

  /**
   * Render a progress bar from a numeric literal binding (0–100).
   */
  private formatProgress(cell: unknown): string | HTMLElement {
    const binding = (cell as { getValue: () => unknown }).getValue() as
      | { type: string; value: string }
      | undefined;
    if (!binding || binding.type !== 'literal') return this.formatCell(cell);
    const num = parseFloat(binding.value);
    if (isNaN(num)) return this.formatCell(cell);
    const pct = Math.max(0, Math.min(100, num));
    const container = document.createElement('div');
    container.className = 'table-progress';
    container.title = `${binding.value}%`;
    const bar = document.createElement('div');
    bar.className = 'table-progress-bar';
    bar.style.width = `${pct}%`;
    container.appendChild(bar);
    const label = document.createElement('span');
    label.className = 'table-progress-label';
    label.textContent = `${Math.round(pct)}%`;
    container.appendChild(label);
    return container;
  }

  /**
   * Render an image from a URI or literal binding containing a URL.
   */
  private formatImage(cell: unknown): string | HTMLElement {
    const binding = (cell as { getValue: () => unknown }).getValue() as
      | { type: string; value: string }
      | undefined;
    if (!binding) return '';
    const src = binding.value;
    if (!src) return '';
    const img = document.createElement('img');
    img.className = 'table-image';
    img.src = src;
    img.alt = src;
    img.title = src;
    return img;
  }

  /**
   * Render a colour swatch from a literal binding containing a CSS colour.
   */
  private formatColor(cell: unknown): string | HTMLElement {
    const binding = (cell as { getValue: () => unknown }).getValue() as
      | { type: string; value: string }
      | undefined;
    if (!binding || !binding.value) return this.formatCell(cell);
    const color = binding.value;
    const container = document.createElement('span');
    container.className = 'table-color';
    container.title = color;
    const swatch = document.createElement('span');
    swatch.className = 'table-color-swatch';
    swatch.style.backgroundColor = color;
    container.appendChild(swatch);
    const label = document.createElement('span');
    label.className = 'table-color-label';
    label.textContent = color;
    container.appendChild(label);
    return container;
  }

  /**
   * Render a description / long text as a wrapping text block.
   */
  private formatDescription(cell: unknown): string | HTMLElement {
    const binding = (cell as { getValue: () => unknown }).getValue() as
      | { type: string; value: string }
      | undefined;
    if (!binding || binding.type !== 'literal') return this.formatCell(cell);
    const span = document.createElement('span');
    span.className = 'table-description';
    span.textContent = binding.value;
    span.title = binding.value;
    return span;
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

    // Update uriHrefAdapter on the URI formatter
    this.uriFormatter.setUriHrefAdapter(config.uriHrefAdapter);
    // Also update config reference for bindingSetAdapter
    this.config = config;
  }

  /**
   * Force Tabulator to re-render all cells (re-runs formatters).
   * Call this after updating a formatter option that should be reflected
   * in an already-rendered table, e.g. changing the URI href adapter.
   */
  redrawTable(): void {
    this.table?.redraw(true);
  }

  /**
   * Update prefix resolver with new prefixes from YASR
   */
  updatePrefixes(prefixMap: Record<string, string>): void {
    this.prefixResolver = new PrefixResolver(prefixMap);
    // Update URI formatter with new prefix resolver while preserving current display mode and adapter
    const currentDisplayMode = this.uriFormatter.getDisplayMode();
    this.uriFormatter = new UriFormatter(
      this.prefixResolver,
      currentDisplayMode,
      this.config.uriHrefAdapter
    );
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

    // Re-setup cell double-click handler
    this.registerCellDblClick();
    
    // Re-apply search filter if one was active
    if (this.currentSearchTerm) {
      this.applySearchFilter(this.currentSearchTerm);
    }
    
    this.currentLayout = mode;
  }
}
