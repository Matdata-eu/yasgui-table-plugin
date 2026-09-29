/**
 * Resource triple queries
 *
 * Builds the SPARQL queries used when a user Ctrl+clicks (or Ctrl+Shift+clicks)
 * a URI in the table, and abbreviates URIs with the prefixes that were declared
 * in the main YASQE query.
 *
 * - `subject`: all triples where the resource is the subject  (<uri> ?p ?o)
 * - `object`:  all triples where the resource is the object   (?s ?p <uri>)
 */

import { PrefixMap } from '../types/config';

export type ResourceDirection = 'subject' | 'object';

/**
 * Characters allowed in the local part of a prefixed name that we are willing
 * to emit. This is deliberately a conservative subset of SPARQL's PN_LOCAL so
 * the generated query is always valid; anything else falls back to <iri>.
 */
const SAFE_LOCAL_NAME = /^[A-Za-z0-9_](?:[A-Za-z0-9_\-.]*[A-Za-z0-9_\-])?$/;
const SAFE_PREFIX = /^(?:[A-Za-z][A-Za-z0-9_\-.]*[A-Za-z0-9_\-]|[A-Za-z])?$/;

/**
 * Keep only well-formed prefix declarations.
 */
export function sanitizePrefixes(prefixes: unknown): PrefixMap {
  const result: PrefixMap = {};
  if (!prefixes || typeof prefixes !== 'object') {
    return result;
  }
  for (const [prefix, namespace] of Object.entries(prefixes as Record<string, unknown>)) {
    if (typeof namespace !== 'string' || !namespace || /[<>"{}|\\^`\s]/.test(namespace)) {
      continue;
    }
    if (!SAFE_PREFIX.test(prefix)) {
      continue;
    }
    result[prefix] = namespace;
  }
  return result;
}

/**
 * Abbreviate a URI to a prefixed name using the given prefixes.
 * Picks the longest matching namespace. Returns `null` when no prefix matches
 * or the resulting local name would not be a valid prefixed name.
 */
export function toPrefixedName(uri: string, prefixes: PrefixMap): string | null {
  let best: { prefix: string; namespace: string } | null = null;
  for (const [prefix, namespace] of Object.entries(prefixes)) {
    if (uri.startsWith(namespace) && (!best || namespace.length > best.namespace.length)) {
      best = { prefix, namespace };
    }
  }
  if (!best) {
    return null;
  }
  const local = uri.substring(best.namespace.length);
  if (local !== '' && !SAFE_LOCAL_NAME.test(local)) {
    return null;
  }
  return `${best.prefix}:${local}`;
}

/**
 * Render a URI as a SPARQL term: a prefixed name when possible, else <iri>.
 */
export function toSparqlTerm(uri: string, prefixes: PrefixMap): string {
  return toPrefixedName(uri, prefixes) ?? `<${uri.replace(/[<>"{}|\\^`\s]/g, encodeURIComponent)}>`;
}

/**
 * Build the CONSTRUCT query that fetches the triples in which `uri` is the
 * subject or the object. All prefixes from the main query are declared so the
 * query stays readable and servers can use them in their Turtle output.
 */
export function buildResourceQuery(
  uri: string,
  direction: ResourceDirection,
  prefixes: PrefixMap = {}
): string {
  const safePrefixes = sanitizePrefixes(prefixes);
  const term = toSparqlTerm(uri, safePrefixes);
  const pattern = direction === 'subject' ? `${term} ?p ?o` : `?s ?p ${term}`;

  const prefixLines = Object.entries(safePrefixes)
    .map(([prefix, namespace]) => `PREFIX ${prefix}: <${namespace}>`)
    .join('\n');

  const body = `CONSTRUCT {\n  ${pattern} .\n}\nWHERE {\n  ${pattern} .\n}`;

  return prefixLines ? `${prefixLines}\n\n${body}` : body;
}

/**
 * Human readable label for a direction, used in menus and the modal title.
 */
export function directionLabel(direction: ResourceDirection): string {
  return direction === 'subject' ? 'as subject' : 'as object';
}
