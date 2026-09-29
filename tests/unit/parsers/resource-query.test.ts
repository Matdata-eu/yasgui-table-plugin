/**
 * Tests for resource triple query building (issue #12 follow-ups)
 */

import {
  buildResourceQuery,
  sanitizePrefixes,
  toPrefixedName,
  toSparqlTerm,
} from '../../../src/parsers/resource-query';

const prefixes = {
  ex: 'http://example.org/',
  exv: 'http://example.org/vocab#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
};

describe('toPrefixedName', () => {
  it('abbreviates with a matching prefix', () => {
    expect(toPrefixedName('http://example.org/Alice', prefixes)).toBe('ex:Alice');
  });

  it('prefers the longest matching namespace', () => {
    expect(toPrefixedName('http://example.org/vocab#name', prefixes)).toBe('exv:name');
  });

  it('returns null when no prefix matches', () => {
    expect(toPrefixedName('http://other.org/x', prefixes)).toBeNull();
  });

  it('returns null when the local name is not a safe prefixed name', () => {
    expect(toPrefixedName('http://example.org/a/b', prefixes)).toBeNull();
    expect(toPrefixedName('http://example.org/a?b=c', prefixes)).toBeNull();
    expect(toPrefixedName('http://example.org/trailing.', prefixes)).toBeNull();
  });
});

describe('toSparqlTerm', () => {
  it('falls back to an IRI reference', () => {
    expect(toSparqlTerm('http://other.org/x', prefixes)).toBe('<http://other.org/x>');
  });
});

describe('sanitizePrefixes', () => {
  it('drops malformed entries', () => {
    expect(
      sanitizePrefixes({ ok: 'http://ok.org/', 'bad prefix': 'http://x/', evil: 'http://x/> } DROP', num: 5 })
    ).toEqual({ ok: 'http://ok.org/' });
  });

  it('keeps the empty (default) prefix', () => {
    expect(sanitizePrefixes({ '': 'http://default.org/' })).toEqual({ '': 'http://default.org/' });
  });

  it('handles non-objects', () => {
    expect(sanitizePrefixes(undefined)).toEqual({});
    expect(sanitizePrefixes('nope')).toEqual({});
  });
});

describe('buildResourceQuery', () => {
  it('builds a subject query with the main query prefixes', () => {
    const query = buildResourceQuery('http://example.org/Alice', 'subject', prefixes);

    expect(query).toContain('PREFIX ex: <http://example.org/>');
    expect(query).toContain('PREFIX exv: <http://example.org/vocab#>');
    expect(query).toContain('CONSTRUCT {\n  ex:Alice ?p ?o .\n}');
    expect(query).toContain('WHERE {\n  ex:Alice ?p ?o .\n}');
  });

  it('builds an object query', () => {
    const query = buildResourceQuery('http://example.org/Alice', 'object', prefixes);
    expect(query).toContain('?s ?p ex:Alice .');
    expect(query).not.toContain('ex:Alice ?p ?o');
  });

  it('uses an IRI reference and no PREFIX lines without prefixes', () => {
    const query = buildResourceQuery('http://other.org/x', 'subject');
    expect(query).toBe('CONSTRUCT {\n  <http://other.org/x> ?p ?o .\n}\nWHERE {\n  <http://other.org/x> ?p ?o .\n}');
  });

  it('never lets a URI break out of the IRI reference', () => {
    const query = buildResourceQuery('http://x.org/a> ?p ?o } #', 'subject');
    expect(query).not.toMatch(/a> \?p/);
  });
});
