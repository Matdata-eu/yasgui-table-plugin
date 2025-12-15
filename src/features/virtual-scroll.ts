/**
 * Virtual Scroll Configuration
 * Configures Tabulator for efficient virtual scrolling
 */

export interface VirtualScrollOptions {
  renderVertical: 'virtual';
  virtualDomBuffer: number;
  height: string;
}

/**
 * Get default virtual scroll configuration
 */
export function getVirtualScrollConfig(rowCount: number): VirtualScrollOptions {
  // For small datasets, use default buffer
  // For large datasets, increase buffer for smoother scrolling
  const buffer = rowCount > 1000 ? 300 : 150;

  return {
    renderVertical: 'virtual',
    virtualDomBuffer: buffer,
    // Use '100%' for height (not maxHeight) to fill container
    // This works with flex layout without causing resize loops
    height: '100%',
  };
}
