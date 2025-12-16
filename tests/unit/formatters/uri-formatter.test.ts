/**
 * Tests for URI Formatter
 */

import { UriFormatter } from '../../../src/formatters/uri-formatter';
import { PrefixResolver } from '../../../src/parsers/prefix-resolver';

// Mock CellComponent
const createMockCell = (binding: any) => ({
  getValue: () => binding,
}) as any;

describe('UriFormatter', () => {
  describe('format with abbreviated mode', () => {
    it('should abbreviate URI with known prefix', () => {
      const prefixResolver = new PrefixResolver();
      const formatter = new UriFormatter(prefixResolver, 'abbreviated');
      const cell = createMockCell({ type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' });
      
      const result = formatter.format(cell);
      
      expect(result).toBeInstanceOf(HTMLElement);
      expect((result as HTMLElement).textContent).toBe('foaf:Person');
    });

    it('should abbreviate RDF URIs', () => {
      const prefixResolver = new PrefixResolver();
      const formatter = new UriFormatter(prefixResolver, 'abbreviated');
      
      const cell = createMockCell({ type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' });
      const result = formatter.format(cell);
      expect((result as HTMLElement).textContent).toBe('rdf:type');
    });

    it('should return local name for unknown prefix', () => {
      const prefixResolver = new PrefixResolver();
      const formatter = new UriFormatter(prefixResolver, 'abbreviated');
      const cell = createMockCell({ type: 'uri', value: 'http://example.org/unknown' });
      
      const result = formatter.format(cell);
      
      expect((result as HTMLElement).textContent).toBe('unknown');
    });
  });

  describe('format with full mode', () => {
    it('should return full URI when mode is full', () => {
      const prefixResolver = new PrefixResolver();
      const formatter = new UriFormatter(prefixResolver, 'full');
      const cell = createMockCell({ type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' });
      
      const result = formatter.format(cell);
      
      expect((result as HTMLElement).textContent).toBe('http://xmlns.com/foaf/0.1/Person');
    });
  });

  describe('setDisplayMode', () => {
    it('should switch between display modes', () => {
      const prefixResolver = new PrefixResolver();
      const formatter = new UriFormatter(prefixResolver, 'abbreviated');
      
      formatter.setDisplayMode('full');
      
      const cell = createMockCell({ type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' });
      const result = formatter.format(cell);
      expect((result as HTMLElement).textContent).toBe('http://xmlns.com/foaf/0.1/Person');
    });
  });

  describe('edge cases', () => {
    it('should handle non-URI bindings', () => {
      const prefixResolver = new PrefixResolver();
      const formatter = new UriFormatter(prefixResolver, 'abbreviated');
      
      const cell = createMockCell({ type: 'literal', value: 'not a uri' });
      const result = formatter.format(cell);
      
      expect(result).toBe('');
    });

    it('should handle undefined binding', () => {
      const prefixResolver = new PrefixResolver();
      const formatter = new UriFormatter(prefixResolver, 'abbreviated');
      
      const cell = createMockCell(undefined);
      const result = formatter.format(cell);
      
      expect(result).toBe('');
    });

    it('should create clickable links', () => {
      const prefixResolver = new PrefixResolver();
      const formatter = new UriFormatter(prefixResolver, 'full');
      const cell = createMockCell({ type: 'uri', value: 'http://example.org/resource' });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result.tagName).toBe('A');
      expect(result.getAttribute('href')).toBe('http://example.org/resource');
      expect(result.getAttribute('target')).toBe('_blank');
    });
  });
});
