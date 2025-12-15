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
import { DisplayControls } from './controls/display-controls.js';
import { FitControls } from './controls/fit-controls.js';
import { ContentModal } from './controls/content-modal.js';
import { ExportControls } from './controls/export-controls.js';
import { CellSelection } from './features/cell-selection.js';
import { ClipboardManager } from './features/clipboard.js';
import { loadDisplayConfig, saveDisplayConfig } from './utils/storage.js';
import { validateConfig } from './utils/validators.js';
import { getCurrentTheme, watchThemeChanges } from './utils/theme.js';

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
  // Plugin metadata (required by YASR) - must be instance properties
  public label: string = 'Table-Dev';
  public priority: number = 10;
  public helpReference?: string;
  
  private iconSvg: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm2 2v4h4V5H5zm6 0v4h4V5h-4zm6 0v4h4V5h-4zM5 11v4h4v-4H5zm6 0v4h4v-4h-4zm6 0v4h4v-4h-4zM5 17v2h4v-2H5zm6 0v2h4v-2h-4zm6 0v2h4v-2h-4z"/></svg>';

  private yasr: Yasr;
  private config: TabulatorPluginConfig;
  private table: Tabulator | null = null;
  private container: HTMLElement | null = null;
  private renderer: TableRenderer | null = null;
  private searchControl: SearchControl | null = null;
  private displayControls: DisplayControls | null = null;
  private fitControls: FitControls | null = null;
  private contentModal: ContentModal | null = null;
  private exportControls: ExportControls | null = null;
  private cellSelection: CellSelection | null = null;
  private clipboardManager: ClipboardManager | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private themeObserverCleanup: (() => void) | null = null;

  constructor(yasr: Yasr) {
    this.yasr = yasr;
    this.helpReference = 'https://yasgui-doc.matdata.eu/docs/user-guide#table-plugin';
    
    // Get plugin config from yasr.config if available
    const pluginConfig = (yasr.config as any)?.pluginsOptions?.['Table-Dev'] as TabulatorPluginConfig | undefined;
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
   * Return icon for plugin selector
   */
  getIcon(): Element | undefined {
    const iconEl = document.createElement('div');
    iconEl.innerHTML = this.iconSvg;
    return iconEl.firstElementChild || undefined;
  }

  /**
   * Determines if plugin can handle current results
   * Returns true for SPARQL SELECT queries only
   */
  canHandleResults(): boolean {
    const results = this.yasr.results;
    if (!results) return false;
    
    // YASR wraps results in a json property
    const data = (results as { json?: SparqlResults }).json || (results as SparqlResults);
    
    return !!(
      data &&
      data.head &&
      Array.isArray(data.head.vars) &&
      data.head.vars.length > 0 &&
      data.results &&
      Array.isArray(data.results.bindings)
    );
  }
  
  /**
   * Get the actual SPARQL results from YASR's wrapper
   */
  private getResultsData(): SparqlResults | null {
    if (!this.yasr.results) return null;
    
    // YASR may wrap results in a json property
    const data = (this.yasr.results as { json?: SparqlResults }).json || (this.yasr.results as SparqlResults);
    
    return data && data.head && data.results ? data : null;
  }

  /**
   * Renders the table visualization
   */
  async draw(_persistentConfig?: PersistentConfig): Promise<void> {
    // Create container
    const container = document.createElement('div');
    container.className = 'yasgui-table-plugin';
    
    // Detect and apply theme
    const theme = getCurrentTheme();
    container.setAttribute('data-theme', theme);
    
    this.container = container;

    // Watch for theme changes
    this.themeObserverCleanup = watchThemeChanges(container, (newTheme) => {
      this.emit('themeChange', { theme: newTheme });
    });

    try {
      // Get actual results data
      const results = this.getResultsData();
      
      // Check if we have results
      if (!results) {
        container.appendChild(this.createEmptyState('No query results available'));
        // Append to YASR results element
        const resultsEl = (this.yasr as any).resultsEl as HTMLElement;
        if (resultsEl) {
          resultsEl.innerHTML = '';
          resultsEl.appendChild(container);
        }
        return;
      }

      // Check if results are empty
      if (
        !results.results ||
        !results.results.bindings ||
        results.results.bindings.length === 0
      ) {
        container.appendChild(this.createEmptyState('No results returned by the query'));
        // Append to YASR results element
        const resultsEl = (this.yasr as any).resultsEl as HTMLElement;
        if (resultsEl) {
          resultsEl.innerHTML = '';
          resultsEl.appendChild(container);
        }
        return;
      }

      // Performance warning for very large datasets
      const rowCount = results.results.bindings.length;
      if (rowCount > 100000) {
        const warning = document.createElement('div');
        warning.className = 'table-performance-warning';
        warning.innerHTML = `<strong>⚠️ Performance Notice:</strong> This table contains ${rowCount.toLocaleString()} rows. Rendering may be slow. Consider filtering your query.`;
        container.appendChild(warning);
      }

      // Create search control
      this.searchControl = new SearchControl({
        placeholder: 'Search in table...',
        debounceMs: 300,
        onSearch: (searchTerm: string) => this.handleSearch(searchTerm),
      });

      // Create display controls
      const displayConfig = this.config.displayConfig || {};
      this.displayControls = new DisplayControls({
        uriDisplayMode: displayConfig.uriDisplayMode || 'full',
        showDatatypes: displayConfig.showDatatypes || false,
        ellipsisMode: displayConfig.ellipsisMode || false,
        onUriDisplayChange: (mode) => this.handleUriDisplayChange(mode),
        onShowDatatypesChange: (show) => this.handleShowDatatypesChange(show),
        onEllipsisModeChange: (enabled) => this.handleEllipsisModeChange(enabled),
      });

      // Create fit controls
      this.fitControls = new FitControls({
        onFitToData: () => this.handleFitToData(),
        onFitToWindow: () => this.handleFitToWindow(),
      });

      // Create content modal
      this.contentModal = new ContentModal();

      // Create export controls
      this.exportControls = new ExportControls({
        onMarkdownCopy: () => this.handleMarkdownExport(),
        onCsvCopy: () => this.handleCsvExport(),
      });

      // Add controls toolbar to container
      const toolbar = document.createElement('div');
      toolbar.className = 'table-controls-toolbar';
      toolbar.appendChild(this.searchControl.getElement());
      toolbar.appendChild(this.displayControls.getElement());
      toolbar.appendChild(this.fitControls.getElement());
      toolbar.appendChild(this.exportControls.getElement());
      container.appendChild(toolbar);

      // Create table container (separate from search control)
      const tableContainer = document.createElement('div');
      tableContainer.className = 'yasgui-table-container';
      container.appendChild(tableContainer);

      // Render table
      if (this.renderer) {
        this.table = this.renderer.render(tableContainer, results);

        // Initialize clipboard manager
        this.clipboardManager = new ClipboardManager();

        // Initialize cell selection
        this.cellSelection = new CellSelection(this.table, (range) => {
          this.emit('selectionChange', { range });
        });

        // Add cell double-click handler for content modal
        if (this.table && this.contentModal) {
          this.table.on('cellDblClick', (_e: any, cell: { getValue: () => unknown }) => {
            const value = cell.getValue();
            let content = '';
            if (value && typeof value === 'object' && 'value' in value) {
              content = (value as { value: string }).value || '';
            } else {
              content = String(value || '');
            }
            this.contentModal?.show(content, 'Cell Content');
            this.emit('cellDoubleClick', { content });
          });
        }

        // Add keyboard handler for Ctrl+C / Cmd+C
        this.attachKeyboardHandlers();

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

    // Append to YASR results element
    const resultsEl = (this.yasr as any).resultsEl as HTMLElement;
    if (resultsEl) {
      resultsEl.innerHTML = '';
      resultsEl.appendChild(container);
    }
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
   * Provide download functionality (required by Plugin interface)
   */
  download(filename?: string): DownloadInfo | undefined {
    const results = this.getResultsData();
    if (!results || !this.table || !this.clipboardManager) return undefined;

    const data = this.getExportData();
    const headers = results.head?.vars || [];
    const csv = this.clipboardManager.formatAsCSV(data, headers);

    return {
      contentType: 'text/csv',
      getData: () => csv,
      filename: filename || this.generateFilename(),
      buttonTitle: 'Download as CSV'
    };
  }
  
  /**
   * Cleanup method called when plugin is destroyed
   */
  destroy(): void {
    // Cleanup theme observer
    if (this.themeObserverCleanup) {
      this.themeObserverCleanup();
      this.themeObserverCleanup = null;
    }
    
    if (this.table) {
      this.table.destroy();
      this.table = null;
    }
    if (this.searchControl) {
      this.searchControl.destroy();
      this.searchControl = null;
    }
    if (this.displayControls) {
      this.displayControls.destroy();
      this.displayControls = null;
    }
    if (this.fitControls) {
      this.fitControls.destroy();
      this.fitControls = null;
    }
    if (this.exportControls) {
      this.exportControls.destroy();
      this.exportControls = null;
    }
    if (this.contentModal) {
      this.contentModal.close();
      this.contentModal = null;
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
    // Merge updates
    this.config = { ...this.config, ...updates };
    if (updates.displayConfig) {
      this.config.displayConfig = { ...this.config.displayConfig, ...updates.displayConfig };
    }

    // Validate
    const validated = validateConfig(this.config);
    this.config = { ...this.config, ...validated };

    // Update renderer if it exists
    if (this.renderer) {
      this.renderer.updateDisplayConfig(this.config);
    }

    // Persist if enabled
    if (this.config.persistenceEnabled && this.config.displayConfig) {
      const dc = this.config.displayConfig;
      if (dc.uriDisplayMode) {
        saveDisplayConfig(this.config.persistenceKey || 'yasgui-table-default', {
          uriDisplayMode: dc.uriDisplayMode,
          showDatatypes: dc.showDatatypes || false,
          ellipsisMode: dc.ellipsisMode || false,
          columnWidths: dc.columnWidths,
          sortState: dc.sortState,
          lastSearch: dc.lastSearch,
        });
      }
    }

    // Emit event
    this.emit('configChange', { config: this.config });

    // Re-render table if it exists
    const results = this.getResultsData();
    if (this.table && this.container && results) {
      // Re-draw asynchronously
      this.draw().catch(err => console.error('Failed to re-render table:', err));
    }
  }

  /**
   * Get current cell/row selection
   */
  getSelection(): SelectionRange | null {
    return this.cellSelection?.getSelectionRange() || null;
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    this.cellSelection?.clearSelection();
    this.emit('selectionCleared', {});
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
   * Handle URI display mode change
   */
  private handleUriDisplayChange(mode: 'full' | 'abbreviated'): void {
    this.updateConfig({
      displayConfig: {
        ...this.config.displayConfig,
        uriDisplayMode: mode,
      },
    });
  }

  /**
   * Handle show datatypes change
   */
  private handleShowDatatypesChange(show: boolean): void {
    this.updateConfig({
      displayConfig: {
        ...this.config.displayConfig,
        showDatatypes: show,
      },
    });
  }

  /**
   * Handle ellipsis mode change
   */
  private handleEllipsisModeChange(enabled: boolean): void {
    this.updateConfig({
      displayConfig: {
        ...this.config.displayConfig,
        ellipsisMode: enabled,
      },
    });
  }

  /**
   * Handle fit to data
   */
  private handleFitToData(): void {
    if (this.table && this.renderer) {
      // Re-render with fitData layout
      this.renderer.setLayout('fitData');
      this.emit('layoutChange', { layout: 'fitData' });
    }
  }

  /**
   * Handle fit to window
   */
  private handleFitToWindow(): void {
    if (this.table && this.renderer) {
      // Re-render with fitColumns layout
      this.renderer.setLayout('fitColumns');
      this.emit('layoutChange', { layout: 'fitColumns' });
    }
  }

  /**
   * Show temporary notification to user
   */
  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    if (!this.container) return;

    const notification = document.createElement('div');
    notification.className = `table-notification table-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;

    // Add to body
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Handle Markdown export
   */
  private handleMarkdownExport(): void {
    const results = this.getResultsData();
    if (!this.clipboardManager || !this.table || !results) {
      return;
    }

    const data = this.getExportData();
    const headers = results.head?.vars || [];
    const markdown = this.clipboardManager.formatAsMarkdown(data, headers);

    this.clipboardManager.copyToClipboard(markdown).then((success) => {
      if (success) {
        this.showNotification('✓ Copied as Markdown', 'success');
        this.emit('copy', { format: 'markdown', success: true });
      } else {
        console.error('Failed to copy markdown to clipboard');
        this.showNotification('✗ Failed to copy to clipboard', 'error');
        this.emit('copy', { format: 'markdown', success: false, error: 'Failed to copy to clipboard' });
      }
    }).catch((error) => {
      console.error('Error copying markdown to clipboard:', error);
      this.showNotification('✗ Failed to copy to clipboard', 'error');
      this.emit('copy', { format: 'markdown', success: false, error: error.message });
    });
  }

  /**
   * Handle CSV export to clipboard
   */
  private handleCsvExport(): void {
    const results = this.getResultsData();
    if (!this.clipboardManager || !this.table || !results) {
      return;
    }

    const data = this.getExportData();
    const headers = results.head?.vars || [];
    const csv = this.clipboardManager.formatAsCSV(data, headers);

    this.clipboardManager.copyToClipboard(csv).then((success) => {
      if (success) {
        this.showNotification('✓ Copied as CSV', 'success');
        this.emit('copy', { format: 'csv', success: true });
      } else {
        console.error('Failed to copy CSV to clipboard');
        this.showNotification('✗ Failed to copy to clipboard', 'error');
        this.emit('copy', { format: 'csv', success: false, error: 'Failed to copy to clipboard' });
      }
    }).catch((error) => {
      console.error('Error copying CSV to clipboard:', error);
      this.showNotification('✗ Failed to copy to clipboard', 'error');
      this.emit('copy', { format: 'csv', success: false, error: error.message });
    });
  }

  /**
   * Get export data respecting search filter
   */
  private getExportData(): string[][] {
    if (!this.table) {
      return [];
    }

    // Get currently displayed rows (respects search filter)
    const rows = this.table.getDataFiltered ? this.table.getDataFiltered() : this.table.getData();
    
    return rows.map((row: any) => {
      const data: string[] = [];
      const rowObj = row as Record<string, unknown>;
      
      // Get values for each variable (exclude internal fields like _id, _rowNum)
      for (const key of Object.keys(rowObj)) {
        if (!key.startsWith('_')) {
          const value = rowObj[key];
          if (value && typeof value === 'object' && 'value' in value) {
            data.push((value as { value: string }).value || '');
          } else {
            data.push(String(value || ''));
          }
        }
      }
      
      return data;
    });
  }

  /**
   * Generate filename with timestamp
   */
  private generateFilename(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `sparql-results-${year}${month}${day}-${hours}${minutes}${seconds}.csv`;
  }

  /**
   * Attach keyboard handlers for copy operations
   */
  private attachKeyboardHandlers(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (this.cellSelection?.hasSelection()) {
          e.preventDefault();
          const text = this.cellSelection.getSelectionAsText();
          this.clipboardManager?.copyToClipboard(text).then((success) => {
            if (success) {
              this.emit('clipboardCopy', { format: 'tsv', success: true });
            }
          });
        }
      }
      // Escape to clear selection
      else if (e.key === 'Escape') {
        if (this.cellSelection?.hasSelection()) {
          this.clearSelection();
        }
      }
    });
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
