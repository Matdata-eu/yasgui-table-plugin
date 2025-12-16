/**
 * Tests for SPARQL bindings parser
 */

import { parseResults } from '../../../src/parsers/bindings-parser';
import { SparqlBinding, SparqlResults } from '../../../src/types/sparql';

describe('parseResults', () => {
  describe('parseResults', () => {
    it('should parse simple SPARQL results', () => {
      const results: SparqlResults = {
        head: { vars: ['s', 'p', 'o'] },
        results: {
          bindings: [
            {
              s: { type: 'uri', value: 'http://example.org/subject' },
              p: { type: 'uri', value: 'http://example.org/predicate' },
              o: { type: 'literal', value: 'object' },
            },
          ],
        },
      };

      const parsed = parseResults(results);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].s).toEqual({ type: 'uri', value: 'http://example.org/subject' });
      expect(parsed[0].p).toEqual({ type: 'uri', value: 'http://example.org/predicate' });
      expect(parsed[0].o).toEqual({ type: 'literal', value: 'object' });
    });

    it('should parse results with typed literals', () => {
      const results: SparqlResults = {
        head: { vars: ['num', 'bool'] },
        results: {
          bindings: [
            {
              num: {
                type: 'literal',
                value: '42',
                datatype: 'http://www.w3.org/2001/XMLSchema#integer',
              },
              bool: {
                type: 'literal',
                value: 'true',
                datatype: 'http://www.w3.org/2001/XMLSchema#boolean',
              },
            },
          ],
        },
      };

      const parsed = parseResults(results);

      expect((parsed[0].num as SparqlBinding).datatype).toBe('http://www.w3.org/2001/XMLSchema#integer');
      expect((parsed[0].bool as SparqlBinding).datatype).toBe('http://www.w3.org/2001/XMLSchema#boolean');
    });

    it('should parse results with language tags', () => {
      const results: SparqlResults = {
        head: { vars: ['label'] },
        results: {
          bindings: [
            {
              label: {
                type: 'literal',
                value: 'Hello',
                'xml:lang': 'en',
              },
            },
            {
              label: {
                type: 'literal',
                value: 'Bonjour',
                'xml:lang': 'fr',
              },
            },
          ],
        },
      };

      const parsed = parseResults(results);

      expect(parsed[0].label['xml:lang']).toBe('en');
      expect(parsed[1].label['xml:lang']).toBe('fr');
    });

    it('should parse results with blank nodes', () => {
      const results: SparqlResults = {
        head: { vars: ['node'] },
        results: {
          bindings: [
            {
              node: { type: 'bnode', value: 'b0' },
            },
            {
              node: { type: 'bnode', value: 'b1' },
            },
          ],
        },
      };

      const parsed = parseResults(results);

      expect((parsed[0].node as SparqlBinding).type).toBe('bnode');
      expect((parsed[0].node as SparqlBinding).value).toBe('b0');
      expect((parsed[1].node as SparqlBinding).value).toBe('b1');
    });

    it('should handle missing bindings (optional values)', () => {
      const results: SparqlResults = {
        head: { vars: ['required', 'optional'] },
        results: {
          bindings: [
            {
              required: { type: 'literal', value: 'value1' },
              optional: { type: 'literal', value: 'present' },
            },
            {
              required: { type: 'literal', value: 'value2' },
              // optional is missing
            },
          ],
        },
      };

      const parsed = parseResults(results);

      expect(parsed[0].optional).toBeDefined();
      expect(parsed[1].optional).toBeUndefined();
    });

    it('should handle empty results', () => {
      const results: SparqlResults = {
        head: { vars: ['s', 'p', 'o'] },
        results: {
          bindings: [],
        },
      };

      const parsed = parseResults(results);

      expect(parsed).toHaveLength(0);
    });

    it('should preserve variable order from head', () => {
      const results: SparqlResults = {
        head: { vars: ['z', 'y', 'x'] },
        results: {
          bindings: [
            {
              x: { type: 'literal', value: 'x-value' },
              y: { type: 'literal', value: 'y-value' },
              z: { type: 'literal', value: 'z-value' },
            },
          ],
        },
      };

      const parsed = parseResults(results);

      const keys = Object.keys(parsed[0]);
      // Filter out internal fields (_id, _rowNum)
      const varKeys = keys.filter(k => !k.startsWith('_'));
      expect(varKeys[0]).toBe('z');
      expect(varKeys[1]).toBe('y');
      expect(varKeys[2]).toBe('x');
    });
  });

  describe('edge cases', () => {
    it('should handle results with special characters in values', () => {
      const specialValue = '<>&"\'\n\t';
      const results: SparqlResults = {
        head: { vars: ['text'] },
        results: {
          bindings: [
            {
              text: { type: 'literal', value: specialValue },
            },
          ],
        },
      };

      const parsed = parseResults(results);

      expect((parsed[0].text as SparqlBinding).value).toBe(specialValue);
    });

    it('should handle very long values', () => {
      const longValue = 'A'.repeat(10000);
      const results: SparqlResults = {
        head: { vars: ['long'] },
        results: {
          bindings: [
            {
              long: { type: 'literal', value: longValue },
            },
          ],
        },
      };

      const parsed = parseResults(results);

      expect((parsed[0].long as SparqlBinding).value).toBe(longValue);
    });

    it('should handle Unicode characters', () => {
      const results: SparqlResults = {
        head: { vars: ['unicode'] },
        results: {
          bindings: [
            {
              unicode: { type: 'literal', value: '你好世界 🌍' },
            },
          ],
        },
      };

      const parsed = parseResults(results);

      expect((parsed[0].unicode as SparqlBinding).value).toBe('你好世界 🌍');
    });
  });
});
