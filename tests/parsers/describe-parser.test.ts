/**
 * Tests for DESCRIBE response parser
 */

import { parseDescribeResponse, formatDescribeObject } from '../../src/parsers/describe-parser';

describe('parseDescribeResponse', () => {
  it('returns empty result for null/undefined responses', async () => {
    const result = await parseDescribeResponse(null);
    expect(result.triples).toEqual([]);
    expect(result.raw).toBe('');
  });

  it('returns empty result for empty string responses', async () => {
    const result = await parseDescribeResponse('');
    expect(result.triples).toEqual([]);
    expect(result.raw).toBe('');
  });

  it('parses SPARQL JSON results with subject/predicate/object bindings', async () => {
    const response = {
      text: async () => JSON.stringify({
        head: { vars: ['subject', 'predicate', 'object'] },
        results: {
          bindings: [
            {
              subject: { type: 'uri', value: 'http://example.org/s' },
              predicate: { type: 'uri', value: 'http://example.org/p' },
              object: { type: 'literal', value: 'hello', 'xml:lang': 'en' },
            },
          ],
        },
      }),
    };

    const result = await parseDescribeResponse(response);
    expect(result.triples).toHaveLength(1);
    expect(result.triples[0]).toEqual({
      subject: 'http://example.org/s',
      predicate: 'http://example.org/p',
      object: { value: 'hello', type: 'literal', lang: 'en', datatype: undefined },
    });
  });

  it('parses N-Triples with URI and literal objects', async () => {
    const nt = `<http://example.org/s> <http://example.org/p> <http://example.org/o> .
<http://example.org/s> <http://example.org/p2> "literal value"@en .
<http://example.org/s> <http://example.org/p3> "42"^^<http://www.w3.org/2001/XMLSchema#integer> .`;

    const result = await parseDescribeResponse(nt);
    expect(result.triples).toHaveLength(3);
    expect(result.triples[0]).toEqual({
      subject: 'http://example.org/s',
      predicate: 'http://example.org/p',
      object: { value: 'http://example.org/o', type: 'uri' },
    });
    expect(result.triples[1]).toEqual({
      subject: 'http://example.org/s',
      predicate: 'http://example.org/p2',
      object: { value: 'literal value', type: 'literal', lang: 'en' },
    });
    expect(result.triples[2]).toEqual({
      subject: 'http://example.org/s',
      predicate: 'http://example.org/p3',
      object: { value: '42', type: 'literal', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
    });
  });

  it('ignores comments and blank lines in N-Triples', async () => {
    const nt = `# This is a comment
<http://example.org/s> <http://example.org/p> <http://example.org/o> .

# Another comment
<http://example.org/s> <http://example.org/p2> "value" .`;

    const result = await parseDescribeResponse(nt);
    expect(result.triples).toHaveLength(2);
  });

  it('parses blank node subjects and objects', async () => {
    const nt = `_:b1 <http://example.org/p> _:b2 .`;
    const result = await parseDescribeResponse(nt);
    expect(result.triples).toHaveLength(1);
    expect(result.triples[0]).toEqual({
      subject: '_:b1',
      predicate: 'http://example.org/p',
      object: { value: '_:b2', type: 'bnode' },
    });
  });

  it('falls back to raw text when response cannot be parsed', async () => {
    const raw = 'This is not valid RDF or JSON';
    const result = await parseDescribeResponse(raw);
    expect(result.triples).toEqual([]);
    expect(result.raw).toBe(raw);
  });

  it('handles Yasqe-style { data: string } responses', async () => {
    const response = { data: '<http://example.org/s> <http://example.org/p> <http://example.org/o> .' };
    const result = await parseDescribeResponse(response);
    expect(result.triples).toHaveLength(1);
  });

  it('unescapes literal strings', async () => {
    const nt = `<http://example.org/s> <http://example.org/p> "line1\\nline2\\ttab" .`;
    const result = await parseDescribeResponse(nt);
    expect(result.triples[0].object.value).toBe('line1\nline2\ttab');
  });
});

describe('formatDescribeObject', () => {
  it('formats URI objects with angle brackets', () => {
    expect(formatDescribeObject({ value: 'http://example.org/o', type: 'uri' })).toBe('<http://example.org/o>');
  });

  it('formats blank node objects as-is', () => {
    expect(formatDescribeObject({ value: '_:b1', type: 'bnode' })).toBe('_:b1');
  });

  it('formats literal objects with language tag', () => {
    expect(formatDescribeObject({ value: 'hello', type: 'literal', lang: 'en' })).toBe('"hello"@en');
  });

  it('formats literal objects with datatype', () => {
    expect(formatDescribeObject({ value: '42', type: 'literal', datatype: 'http://www.w3.org/2001/XMLSchema#integer' })).toBe('"42"^^<http://www.w3.org/2001/XMLSchema#integer>');
  });

  it('formats plain literal objects', () => {
    expect(formatDescribeObject({ value: 'plain', type: 'literal' })).toBe('"plain"');
  });
});
