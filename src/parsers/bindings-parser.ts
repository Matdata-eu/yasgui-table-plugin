/**
 * Bindings Parser
 * Transforms SPARQL results to TableRow format for Tabulator
 */

import { SparqlResults, ResultRow, SparqlBinding } from '../types/sparql';
import { TableRow } from '../types/table';

/**
 * Parse SPARQL results into table rows
 */
export function parseResults(results: SparqlResults): TableRow[] {
  // Validate input
  if (!results) {
    throw new Error('Invalid SPARQL results: results object is null or undefined');
  }

  if (!results.head || !Array.isArray(results.head.vars)) {
    throw new Error('Invalid SPARQL results: missing or invalid head.vars');
  }

  if (!results.results || !Array.isArray(results.results.bindings)) {
    throw new Error('Invalid SPARQL results: missing or invalid results.bindings');
  }

  try {
    return results.results.bindings.map((binding, index) =>
      parseResultRow(binding, index + 1, results.head.vars)
    );
  } catch (error) {
    console.error('Error parsing SPARQL results:', error);
    throw new Error(`Failed to parse SPARQL results: ${error}`);
  }
}

/**
 * Parse a single result row
 */
function parseResultRow(binding: ResultRow, rowNum: number, vars: string[]): TableRow {
  const row: TableRow = {
    _id: `row-${rowNum}`,
    _rowNum: rowNum,
  };

  // Add all variable bindings
  for (const varName of vars) {
    const sparqlBinding = binding[varName];
    if (sparqlBinding) {
      // Store the binding object for formatters to use
      row[varName] = sparqlBinding;
    } else {
      // Unbound variable
      row[varName] = undefined;
    }
  }

  return row;
}

/**
 * Extract raw value from SPARQL binding for sorting/filtering
 */
export function extractRawValue(binding: SparqlBinding | undefined): string {
  if (!binding) {
    return '';
  }
  return binding.value || '';
}

/**
 * Get display value from SPARQL binding
 */
export function getDisplayValue(
  binding: SparqlBinding | undefined,
  uriDisplayMode: 'full' | 'abbreviated' = 'full'
): string {
  if (!binding) {
    return '';
  }

  if (binding.type === 'uri' && uriDisplayMode === 'abbreviated') {
    // Try to abbreviate URI (will be enhanced by prefix resolver)
    const lastHash = binding.value.lastIndexOf('#');
    const lastSlash = binding.value.lastIndexOf('/');
    const splitIndex = Math.max(lastHash, lastSlash);

    if (splitIndex > 0) {
      return binding.value.substring(splitIndex + 1);
    }
  }

  return binding.value;
}
