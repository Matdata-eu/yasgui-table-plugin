/**
 * Main Plugin Class
 * Implements the YASR plugin interface for table rendering
 */

import '../styles/index.css';
import { TabulatorPluginConfig, DEFAULT_CONFIG } from './types/config';
import { SparqlResults } from './types/sparql';
import { SelectionRange } from './types/table';
import { Tabulator } from './types/tabulator';

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
  private eventHandlers: Map<string, EventHandler[]> = new Map();

  constructor(yasr: Yasr, pluginConfig?: TabulatorPluginConfig) {
    this.yasr = yasr;
    this.config = { ...DEFAULT_CONFIG, ...pluginConfig };
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

    // TODO: Implement table rendering
    // 1. Parse SPARQL results
    // 2. Generate columns
    // 3. Initialize Tabulator
    // 4. Attach event handlers
    // 5. Render controls

    // Placeholder content
    const placeholder = document.createElement('div');
    placeholder.textContent = 'Table plugin initialized';
    container.appendChild(placeholder);

    return container;
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
}
