/**
 * SPARQL Result Types
 * Represents SPARQL SELECT query results following the YASR standard format
 */

export type BindingType = 'uri' | 'literal' | 'bnode';

export interface SparqlBinding {
  type: BindingType;
  value: string;
  datatype?: string; // e.g., "http://www.w3.org/2001/XMLSchema#integer"
  'xml:lang'?: string; // e.g., "en", "fr"
}

export interface ResultRow {
  [varName: string]: SparqlBinding | undefined;
}

export interface SparqlResults {
  head: {
    vars: string[]; // SPARQL variable names (without '?')
  };
  results: {
    bindings: ResultRow[];
  };
}
