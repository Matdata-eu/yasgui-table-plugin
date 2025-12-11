/**
 * Plugin Entry Point
 * Exports the TablePlugin class as default export
 */

export { TablePlugin } from './plugin';
export { TablePlugin as default } from './plugin';

// Export types for consumers
export type {
  TabulatorPluginConfig,
  DisplayConfiguration,
  UriDisplayMode,
} from './types/config';

export type { SparqlResults, SparqlBinding, ResultRow } from './types/sparql';

export type { TableRow, TableColumn, SelectionRange } from './types/table';
