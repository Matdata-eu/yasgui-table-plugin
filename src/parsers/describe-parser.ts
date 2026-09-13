/**
 * DESCRIBE query response parser
 *
 * Normalizes the raw response from yasr.executeQuery() into a simple triple
 * representation that can be rendered in a modal table. Falls back to the raw
 * response text when the response cannot be parsed as SPARQL JSON triples or
 * N-Triples.
 */

import { YasrBinding } from '../types/config';
import { Parser } from 'n3';

export interface DescribeTriple {
  subject: string;
  predicate: string;
  object: {
    value: string;
    type: 'uri' | 'literal' | 'bnode';
    datatype?: string;
    lang?: string;
  };
}

export interface DescribeParseResult {
  triples: DescribeTriple[];
  raw: string;
}

/**
 * Extract raw text from a background query response.
 * Handles Fetch Response, Yasqe-style { data: string }, and plain strings.
 */
async function extractRawText(response: unknown): Promise<string> {
  if (!response) {
    return '';
  }

  const res = response as any;

  if (typeof res.text === 'function') {
    return res.text();
  }

  if (typeof res.data === 'string') {
    return res.data;
  }

  if (typeof response === 'string') {
    return response;
  }

  return '';
}

/**
 * Parse the raw response from a DESCRIBE background query.
 *
 * Order of parsing:
 * 1. SPARQL JSON results with subject/predicate/object bindings.
 * 2. Turtle/N-Triples via N3 (handles @prefix, multi-line statements, numbers,
 *    booleans, lists, etc.).
 * 3. Fall back to returning the raw text with no parsed triples.
 */
export async function parseDescribeResponse(response: unknown): Promise<DescribeParseResult> {
  const raw = await extractRawText(response);

  if (!raw.trim()) {
    return { triples: [], raw: '' };
  }

  // Try SPARQL JSON first
  const jsonTriples = tryParseSparqlJson(raw);
  if (jsonTriples.length > 0) {
    return { triples: jsonTriples, raw };
  }

  // Try Turtle/N-Triples with N3 parser
  const n3Triples = parseWithN3(raw);
  if (n3Triples.length > 0) {
    return { triples: n3Triples, raw };
  }

  return { triples: [], raw };
}

/**
 * Attempt to parse the raw text as SPARQL JSON results containing
 * subject/predicate/object bindings.
 */
function tryParseSparqlJson(raw: string): DescribeTriple[] {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    const bindings: YasrBinding[] =
      parsed?.results?.bindings || parsed?.bindings || (Array.isArray(parsed) ? parsed : []);

    if (!Array.isArray(bindings)) {
      return [];
    }

    const triples: DescribeTriple[] = [];

    for (const binding of bindings) {
      if (!binding.subject?.value || !binding.predicate?.value || !binding.object?.value) {
        continue;
      }

      const objectType = (binding.object.type || 'uri') as 'uri' | 'literal' | 'bnode';

      triples.push({
        subject: binding.subject.value,
        predicate: binding.predicate.value,
        object: {
          value: binding.object.value,
          type: objectType,
          datatype: binding.object.datatype,
          lang: binding.object['xml:lang'],
        },
      });
    }

    return triples;
  } catch {
    return [];
  }
}

/**
 * Parse Turtle/N-Triples using the N3 library.
 */
function parseWithN3(raw: string): DescribeTriple[] {
  try {
    const parser = new Parser();
    const quads = parser.parse(raw);
    const triples: DescribeTriple[] = [];

    for (const quad of quads) {
      const subject = quad.subject.termType === 'BlankNode'
        ? quad.subject.value
        : quad.subject.value;
      const predicate = quad.predicate.value;

      let object: DescribeTriple['object'];

      if (quad.object.termType === 'Literal') {
        object = {
          value: quad.object.value,
          type: 'literal',
          datatype: quad.object.datatype?.value,
          lang: quad.object.language || undefined,
        };
      } else if (quad.object.termType === 'BlankNode') {
        object = { value: quad.object.value, type: 'bnode' };
      } else {
        object = { value: quad.object.value, type: 'uri' };
      }

      triples.push({ subject, predicate, object });
    }

    return triples;
  } catch (error) {
    console.warn('yasgui-table-plugin: failed to parse DESCRIBE response with N3', error);
    return [];
  }
}

/**
 * Format a triple object for display.
 */
export function formatDescribeObject(object: DescribeTriple['object']): string {
  if (object.type === 'uri') {
    return `<${object.value}>`;
  }
  if (object.type === 'bnode') {
    return object.value;
  }

  let formatted = `"${object.value}"`;
  if (object.lang) {
    formatted += `@${object.lang}`;
  } else if (object.datatype) {
    formatted += `^^<${object.datatype}>`;
  }
  return formatted;
}
