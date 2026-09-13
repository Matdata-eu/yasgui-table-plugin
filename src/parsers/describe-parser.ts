/**
 * DESCRIBE query response parser
 *
 * Normalizes the raw response from yasr.executeQuery() into a simple triple
 * representation that can be rendered in a modal table. Falls back to the raw
 * response text when the response cannot be parsed as SPARQL JSON triples or
 * N-Triples.
 */

import { YasrBinding } from '../types/config';

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
 * 2. N-Triples (a strict subset of Turtle).
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

  // Try N-Triples
  const ntTriples = parseNTriples(raw);
  if (ntTriples.length > 0) {
    return { triples: ntTriples, raw };
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
 * Parse N-Triples text into triples.
 *
 * Supports:
 * - URI subjects/predicates: <http://...>
 * - URI objects: <http://...>
 * - Literal objects: "value" or "value"@lang or "value"^^<datatype>
 * - Blank node subjects/objects: _:name
 *
 * Lines starting with # are treated as comments and ignored.
 */
function parseNTriples(raw: string): DescribeTriple[] {
  const triples: DescribeTriple[] = [];
  const lines = raw.split(/\r?\n/);

  // Regex for an N-Triples statement.
  // Group 1: subject (URI or blank node)
  // Group 2: predicate (URI)
  // Group 3: object (URI, blank node, or literal with optional @lang/^^datatype)
  const statementRegex = /^\s*(<[^>]+>|_:[^\s]+)\s+(<[^>]+>)\s+(<[^>]+>|_:[^\s]+|"(?:[^"\\]|\\.)*"(?:@[^\s]+|\^\^<[^>]+>)?)\s*\.\s*(?:#.*)?$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = statementRegex.exec(trimmed);
    if (!match) {
      continue;
    }

    const subjectRaw = match[1];
    const predicateRaw = match[2];
    const objectRaw = match[3];

    const subject = parseSubjectOrPredicate(subjectRaw);
    const predicate = parseSubjectOrPredicate(predicateRaw);
    const object = parseObject(objectRaw);

    if (!subject || !predicate || !object) {
      continue;
    }

    triples.push({ subject, predicate, object });
  }

  return triples;
}

function parseSubjectOrPredicate(token: string): string | null {
  if (token.startsWith('<') && token.endsWith('>')) {
    return token.slice(1, -1);
  }
  if (token.startsWith('_:')) {
    return token;
  }
  return null;
}

function parseObject(token: string): DescribeTriple['object'] | null {
  if (token.startsWith('<') && token.endsWith('>')) {
    return { value: token.slice(1, -1), type: 'uri' };
  }

  if (token.startsWith('_:')) {
    return { value: token, type: 'bnode' };
  }

  if (token.startsWith('"')) {
    return parseLiteral(token);
  }

  return null;
}

/**
 * Parse a literal token of the forms:
 *   "value"
 *   "value"@lang
 *   "value"^^<datatype>
 */
function parseLiteral(token: string): DescribeTriple['object'] | null {
  // Find the closing unescaped quote
  let valueEnd = -1;
  for (let i = 1; i < token.length; i++) {
    if (token[i] === '"' && token[i - 1] !== '\\') {
      valueEnd = i;
      break;
    }
  }

  if (valueEnd === -1) {
    return null;
  }

  let value = token.slice(1, valueEnd);
  // Unescape N-Triples escape sequences
  value = unescapeLiteral(value);

  const suffix = token.slice(valueEnd + 1);
  let lang: string | undefined;
  let datatype: string | undefined;

  if (suffix.startsWith('@')) {
    lang = suffix.slice(1);
  } else if (suffix.startsWith('^^<') && suffix.endsWith('>')) {
    datatype = suffix.slice(3, -1);
  }

  return { value, type: 'literal', lang, datatype };
}

function unescapeLiteral(value: string): string {
  return value
    .replace(/\\t/g, '\t')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\U([0-9a-fA-F]{8})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
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
