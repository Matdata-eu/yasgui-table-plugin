/**
 * Prefix Resolver
 * Handles URI abbreviation and expansion using prefix maps
 */

import { PrefixMap } from '../types/config';

// Common prefixes
const COMMON_PREFIXES: PrefixMap = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  foaf: 'http://xmlns.com/foaf/0.1/',
  dc: 'http://purl.org/dc/elements/1.1/',
  dcterms: 'http://purl.org/dc/terms/',
  skos: 'http://www.w3.org/2004/02/skos/core#',
};

export class PrefixResolver {
  private prefixMap: PrefixMap;

  constructor(customPrefixes?: PrefixMap) {
    this.prefixMap = { ...COMMON_PREFIXES, ...customPrefixes };
  }

  /**
   * Abbreviate URI using known prefixes
   */
  abbreviate(uri: string): string {
    for (const [prefix, namespace] of Object.entries(this.prefixMap)) {
      if (uri.startsWith(namespace)) {
        return `${prefix}:${uri.substring(namespace.length)}`;
      }
    }

    // Fallback: extract local name from URI
    const lastHash = uri.lastIndexOf('#');
    const lastSlash = uri.lastIndexOf('/');
    const splitIndex = Math.max(lastHash, lastSlash);

    if (splitIndex > 0) {
      return uri.substring(splitIndex + 1);
    }

    return uri;
  }

  /**
   * Expand abbreviated URI to full URI
   */
  expand(abbreviated: string): string {
    const colonIndex = abbreviated.indexOf(':');
    if (colonIndex > 0) {
      const prefix = abbreviated.substring(0, colonIndex);
      const localName = abbreviated.substring(colonIndex + 1);

      if (this.prefixMap[prefix]) {
        return this.prefixMap[prefix] + localName;
      }
    }

    return abbreviated;
  }

  /**
   * Add custom prefix
   */
  addPrefix(prefix: string, namespace: string): void {
    this.prefixMap[prefix] = namespace;
  }

  /**
   * Get all prefixes
   */
  getPrefixes(): PrefixMap {
    return { ...this.prefixMap };
  }
}
