/**
 * Main Plugin Class
 * Implements the YASR plugin interface for table rendering
 */

import '../styles/index.css';
import { TabulatorPluginConfig, DEFAULT_CONFIG } from './types/config.js';
import { SparqlResults } from './types/sparql.js';
import { SelectionRange } from './types/table.js';
import { Tabulator } from './types/tabulator.js';
import { TableRenderer } from './table-renderer.js';
import { SearchControl } from './controls/search-control.js';
import { loadDisplayConfig, saveDisplayConfig } from './utils/storage.js';
import { validateConfig } from './utils/validators.js';

type EventHandler = (...args: unknown[]) => void;

interface Yasr {
  results?: SparqlResults;
  container: HTMLElement;
  config: unknown;
}

interface PersistentConfig {
  [key: string]: unknown;
}

interface DownloadInfo {
  getData: () => string;
  filename: string;
  contentType: string;
  buttonTitle: string;
}

export class TablePlugin {
  // Plugin metadata (required by YASR)
  static readonly label: string = 'Table';
  static readonly icon: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm2 2v4h4V5H5zm6 0v4h4V5h-4zm6 0v4h4V5h-4zM5 11v4h4v-4H5zm6 0v4h4v-4h-4zm6 0v4h4v-4h-4zM5 17v2h4v-2H5zm6 0v2h4v-2h-4zm6 0v2h4v-2h-4z"/></svg>';
  static readonly priority: number = 10;

  private yasr: Yasr;
  private config: TabulatorPluginConfig;
  private table: Tabulator | null = null;
  private container: HTMLElement | null = null;
  private renderer: TableRenderer | null = null;
  private searchControl: SearchControl | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();

  constructor(yasr: Yasr, pluginConfig?: TabulatorPluginConfig) {
    this.yasr = yasr;
    this.config = { ...DEFAULT_CONFIG, ...pluginConfig };

    // Validate and merge config
    const validated = validateConfig(pluginConfig || {});
    this.config = { ...DEFAULT_CONFIG, ...validated };

    // Load persisted display config
    if (this.config.persistenceEnabled) {
      const stored = loadDisplayConfig(this.config.persistenceKey || 'yasgui-table-default');
      if (stored) {
        this.config.displayConfig = { ...this.config.displayConfig, ...stored };
      }
    }

    // Initialize renderer with callbacks
    this.renderer = new TableRenderer(
      this.config,
      (widths) => this.handleColumnWidthChange(widths),
      (column, dir) => this.handleSortChange(column, dir)
    );
  }

  /**
   * Determines if plugin can handle current results
   * Returns true for SPARQL SELECT queries only
   */
  canHandleResults(): boolean {
    const results = this.yasr.results;
    return !!(
      results &&
      results.head &&
      Array.isArray(results.head.vars) &&
      results.head.vars.length > 0 &&
      results.results &&
      Array.isArray(results.results.bindings)
    );
  }

  /**
   * Renders the table visualization
   */
  draw(_persistentConfig?: PersistentConfig): HTMLElement {
    // Create container
    const container = document.createElement('div');
    container.className = 'yasgui-table-plugin';
    this.container = container;

    try {
      // Check if we have results
      if (!this.yasr.results) {
        container.appendChild(this.createEmptyState('No query results available'));
        return container;
      }

      // Check if results are empty
      if (
        !this.yasr.results.results ||
        !this.yasr.results.results.bindings ||
        this.yasr.results.results.bindings.length === 0
      ) {
        container.appendChild(this.createEmptyState('No results returned by the query'));
        return container;
      }

      // Create search control
      this.searchControl = new SearchControl({
        placeholder: 'Search in table...',
        debounceMs: 300,
        onSearch: (searchTerm: string) => this.handleSearch(searchTerm),
      });

      // Add search control to container
      container.appendChild(this.searchControl.getElement());

      // Create table container (separate from search control)
      const tableContainer = document.createElement('div');
      tableContainer.className = 'yasgui-table-container';
      container.appendChild(tableContainer);

      // Render table
      if (this.renderer) {
        this.table = this.renderer.render(tableContainer, this.yasr.results);

        // Restore last search term if available
        const lastSearch = this.config.displayConfig?.lastSearch;
        if (lastSearch) {
          this.searchControl.setSearchTerm(lastSearch, true);
        } else {
          // Update initial row count
          const totalRows = this.renderer.getTotalRowCount();
          this.searchControl.updateRowCount(totalRows, totalRows);
        }

        // Save config on changes
        if (
          this.config.persistenceEnabled &&
          this.config.displayConfig &&
          this.config.displayConfig.uriDisplayMode
        ) {
          saveDisplayConfig(this.config.persistenceKey || 'yasgui-table-default', {
            uriDisplayMode: this.config.displayConfig.uriDisplayMode,
            showDatatypes: this.config.displayConfig.showDatatypes || false,
            ellipsisMode: this.config.displayConfig.ellipsisMode || false,
            lastSearch: this.config.displayConfig.lastSearch,
          });
        }
      }
    } catch (error) {
      console.error('Failed to render table:', error);
      container.appendChild(
        this.createEmptyState('Error rendering table. Please check the console for details.')
      );
    }

    return container;
  }

  /**
   * Create empty state message
   */
  private createEmptyState(message: string): HTMLElement {
    const emptyState = document.createElement('div');
    emptyState.className = 'yasgui-table-empty';
    emptyState.style.padding = '40px';
    emptyState.style.textAlign = 'center';
    emptyState.style.color = 'var(--table-text-muted, #999)';
    emptyState.textContent = message;
    return emptyState;
  }

  /**
   * Returns download information for current table
   */
  getDownloadInfo(): DownloadInfo {
    return {
      getData: () => {
        // TODO: Implement data export
        return 'Export not yet implemented';
      },
      filename: 'sparql-results.tsv',
      contentType: 'text/tab-separated-values',
      buttonTitle: 'Download as TSV',
    };
  }

  /**
   * Cleanup method called when plugin is destroyed
   */
  destroy(): void {
    if (this.table) {
      this.table.destroy();
      this.table = null;
    }
    if (this.searchControl) {
      this.searchControl.destroy();
      this.searchControl = null;
    }
    this.eventHandlers.clear();
    this.container = null;
  }

  /**
   * Get current plugin configuration
   */
  getConfig(): TabulatorPluginConfig {
    return { ...this.config };
  }

  /**
   * Update plugin configuration
   */
  updateConfig(updates: Partial<TabulatorPluginConfig>): void {
    this.config = { ...this.config, ...updates };
    // TODO: Re-render if needed
  }

  /**
   * Get current cell/row selection
   */
  getSelection(): SelectionRange | null {
    // TODO: Implement selection tracking
    return null;
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    // TODO: Implement selection clearing
  }

  /**
   * Register event handler
   */
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Unregister event handler
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to registered handlers
   */
  private emit(event: string, data?: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Handle column width changes
   */
  private handleColumnWidthChange(widths: Record<string, number>): void {
    // Update config
    if (!this.config.displayConfig) {
      this.config.displayConfig = {};
    }
    this.config.displayConfig.columnWidths = widths;

    // Persist if enabled
    if (this.config.persistenceEnabled && this.config.displayConfig.uriDisplayMode) {
      saveDisplayConfig(this.config.persistenceKey || 'yasgui-table-default', {
        uriDisplayMode: this.config.displayConfig.uriDisplayMode,
        showDatatypes: this.config.displayConfig.showDatatypes || false,
        ellipsisMode: this.config.displayConfig.ellipsisMode || false,
        columnWidths: widths,
      });
    }

    // Emit event
    this.emit('columnResize', { widths });
  }

  /**
   * Handle sort changes
   */
  private handleSortChange(column: string, dir: 'asc' | 'desc'): void {
    // Update config
    if (!this.config.displayConfig) {
      this.config.displayConfig = {};
    }
    this.config.displayConfig.sortState = { column, dir };

    // Persist if enabled
    if (this.config.persistenceEnabled && this.config.displayConfig.uriDisplayMode) {
      saveDisplayConfig(this.config.persistenceKey || 'yasgui-table-default', {
        uriDisplayMode: this.config.displayConfig.uriDisplayMode,
        showDatatypes: this.config.displayConfig.showDatatypes || false,
        ellipsisMode: this.config.displayConfig.ellipsisMode || false,
        sortState: { column, dir },
      });
    }

    // Emit event
    this.emit('columnSort', { column, dir });
  }

  /**
   * Handle search filter
   */
  private handleSearch(searchTerm: string): void {
    if (!this.renderer) {
      return;
    }

    // Apply filter
    const filteredCount = this.renderer.applySearchFilter(searchTerm);
    const totalCount = this.renderer.getTotalRowCount();

    // Update search control display
    if (this.searchControl) {
      this.searchControl.updateRowCount(filteredCount, totalCount);
    }

    // Update config
    if (!this.config.displayConfig) {
      this.config.displayConfig = {};
    }
    this.config.displayConfig.lastSearch = searchTerm;

    // Persist if enabled
    if (this.config.persistenceEnabled && this.config.displayConfig.uriDisplayMode) {
      saveDisplayConfig(this.config.persistenceKey || 'yasgui-table-default', {
        uriDisplayMode: this.config.displayConfig.uriDisplayMode,
        showDatatypes: this.config.displayConfig.showDatatypes || false,
        ellipsisMode: this.config.displayConfig.ellipsisMode || false,
        lastSearch: searchTerm,
      });
    }

    // Emit event
    this.emit('search', { searchTerm, filteredCount, totalCount });
  }
}
