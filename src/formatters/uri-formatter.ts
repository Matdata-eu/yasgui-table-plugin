/**
 * URI Formatter
 * Formats URI bindings with full or abbreviated display
 */

import { SparqlBinding } from '../types/sparql';
import { PrefixResolver } from '../parsers/prefix-resolver';
import { CellComponent } from '../types/tabulator';

export interface UriFormatterCallbacks {
  /** Called when the user Ctrl+clicks (or Cmd+clicks) a URI link. */
  onUriCtrlClick?: (uri: string) => void;
  /** Called when the user right-clicks a URI link; return true to allow the default browser menu. */
  onUriContextMenu?: (uri: string, x: number, y: number) => void;
}

export class UriFormatter {
  private prefixResolver: PrefixResolver;
  private displayMode: 'full' | 'abbreviated';
  private uriHrefAdapter?: (uri: string) => string;
  private callbacks: UriFormatterCallbacks;

  constructor(
    prefixResolver: PrefixResolver,
    displayMode: 'full' | 'abbreviated' = 'full',
    uriHrefAdapter?: (uri: string) => string,
    callbacks?: UriFormatterCallbacks
  ) {
    this.prefixResolver = prefixResolver;
    this.displayMode = displayMode;
    this.uriHrefAdapter = uriHrefAdapter;
    this.callbacks = callbacks || {};
  }

  /**
   * Format URI binding for display
   */
  format(cell: CellComponent): string | HTMLElement {
    const binding = cell.getValue() as SparqlBinding | undefined;

    if (!binding || binding.type !== 'uri') {
      return '';
    }

    const uri = binding.value;
    // Only abbreviate when displayMode is 'abbreviated'
    const displayText =
      this.displayMode === 'abbreviated' ? this.prefixResolver.abbreviate(uri) : uri;

    // Apply uriHrefAdapter if provided, otherwise use the raw URI as href
    const href = this.uriHrefAdapter ? this.uriHrefAdapter(uri) : uri;

    // Create link element
    const link = document.createElement('a');
    link.href = href;
    link.textContent = displayText;
    link.className = 'table-uri-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = uri; // Always show full URI on hover

    // Prevent link from interfering with table interactions
    link.addEventListener('click', (e) => {
      e.stopPropagation();

      // Ctrl+click (or Cmd+click on macOS) triggers a background DESCRIBE query
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (this.callbacks.onUriCtrlClick) {
          this.callbacks.onUriCtrlClick(uri);
        }
      }
    });

    // Right-click context menu for additional URI actions
    link.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.callbacks.onUriContextMenu) {
        this.callbacks.onUriContextMenu(uri, e.clientX, e.clientY);
      }
    });

    return link;
  }

  /**
   * Update display mode
   */
  setDisplayMode(mode: 'full' | 'abbreviated'): void {
    this.displayMode = mode;
  }

  /**
   * Get current display mode
   */
  getDisplayMode(): 'full' | 'abbreviated' {
    return this.displayMode;
  }

  /**
   * Update URI href adapter
   */
  setUriHrefAdapter(adapter: ((uri: string) => string) | undefined): void {
    this.uriHrefAdapter = adapter;
  }

  /**
   * Update URI interaction callbacks
   */
  setCallbacks(callbacks: UriFormatterCallbacks): void {
    this.callbacks = callbacks;
  }
}
