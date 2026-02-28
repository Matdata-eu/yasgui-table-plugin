/**
 * URI Formatter
 * Formats URI bindings with full or abbreviated display
 */

import { SparqlBinding } from '../types/sparql';
import { PrefixResolver } from '../parsers/prefix-resolver';
import { CellComponent } from '../types/tabulator';

export class UriFormatter {
  private prefixResolver: PrefixResolver;
  private displayMode: 'full' | 'abbreviated';
  private uriHrefAdapter?: (uri: string) => string;

  constructor(
    prefixResolver: PrefixResolver,
    displayMode: 'full' | 'abbreviated' = 'full',
    uriHrefAdapter?: (uri: string) => string
  ) {
    this.prefixResolver = prefixResolver;
    this.displayMode = displayMode;
    this.uriHrefAdapter = uriHrefAdapter;
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
}
