/**
 * Plugin Entry Point
 * Exports the TablePlugin class as default export
 */
import TablePlugin from './TablePlugin.js';

// Auto-register plugin if Yasgui is available (UMD global)
if (typeof window !== 'undefined' && window.Yasgui && window.Yasgui.Yasr) {
  window.Yasgui.Yasr.registerPlugin('Table', TablePlugin);
}

export default TablePlugin;

// Export types for consumers
export type {
  TabulatorPluginConfig,
  DisplayConfiguration,
  UriDisplayMode,
} from './types/config';

export type { SparqlResults, SparqlBinding, ResultRow } from './types/sparql';

export type { TableRow, TableColumn, SelectionRange } from './types/table';
