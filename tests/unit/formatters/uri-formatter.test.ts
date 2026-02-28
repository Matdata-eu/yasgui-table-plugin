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

  describe('uriHrefAdapter', () => {
    it('should use uriHrefAdapter to transform the link href', () => {
      const prefixResolver = new PrefixResolver();
      const adapter = (uri: string) => `https://faceted-browser.example.org/?uri=${encodeURIComponent(uri)}`;
      const formatter = new UriFormatter(prefixResolver, 'full', adapter);
      const cell = createMockCell({ type: 'uri', value: 'http://example.org/resource' });

      const result = formatter.format(cell) as HTMLElement;

      expect(result.tagName).toBe('A');
      expect(result.getAttribute('href')).toBe(
        'https://faceted-browser.example.org/?uri=http%3A%2F%2Fexample.org%2Fresource'
      );
      // Display text should still show the original URI
      expect(result.textContent).toBe('http://example.org/resource');
    });

    it('should display abbreviated text while using adapted href', () => {
      const prefixResolver = new PrefixResolver();
      const adapter = (uri: string) => `https://faceted-browser.example.org/?uri=${encodeURIComponent(uri)}`;
      const formatter = new UriFormatter(prefixResolver, 'abbreviated', adapter);
      const cell = createMockCell({ type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' });

      const result = formatter.format(cell) as HTMLElement;

      expect(result.tagName).toBe('A');
      expect(result.getAttribute('href')).toBe(
        'https://faceted-browser.example.org/?uri=http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2FPerson'
      );
      // Display text should be abbreviated
      expect(result.textContent).toBe('foaf:Person');
    });

    it('should update uriHrefAdapter via setUriHrefAdapter', () => {
      const prefixResolver = new PrefixResolver();
      const formatter = new UriFormatter(prefixResolver, 'full');
      const cell = createMockCell({ type: 'uri', value: 'http://example.org/resource' });

      // Without adapter, href equals the URI
      const result1 = formatter.format(cell) as HTMLElement;
      expect(result1.getAttribute('href')).toBe('http://example.org/resource');

      // Set adapter
      formatter.setUriHrefAdapter((uri) => `https://faceted.example.org/?resource=${encodeURIComponent(uri)}`);
      const result2 = formatter.format(cell) as HTMLElement;
      expect(result2.getAttribute('href')).toBe(
        'https://faceted.example.org/?resource=http%3A%2F%2Fexample.org%2Fresource'
      );

      // Remove adapter
      formatter.setUriHrefAdapter(undefined);
      const result3 = formatter.format(cell) as HTMLElement;
      expect(result3.getAttribute('href')).toBe('http://example.org/resource');
    });

    it('should apply DBPedia to Wikipedia style adapter', () => {
      const prefixResolver = new PrefixResolver();
      const adapter = (uri: string) => {
        if (uri.startsWith('http://fr.dbpedia.org/resource/')) {
          return 'http://fr.wikipedia.org/wiki/' + uri.substring('http://fr.dbpedia.org/resource/'.length);
        }
        return uri;
      };
      const formatter = new UriFormatter(prefixResolver, 'full', adapter);

      const dbpediaCell = createMockCell({ type: 'uri', value: 'http://fr.dbpedia.org/resource/Paris' });
      const dbpediaResult = formatter.format(dbpediaCell) as HTMLElement;
      expect(dbpediaResult.getAttribute('href')).toBe('http://fr.wikipedia.org/wiki/Paris');

      const otherCell = createMockCell({ type: 'uri', value: 'http://example.org/other' });
      const otherResult = formatter.format(otherCell) as HTMLElement;
      expect(otherResult.getAttribute('href')).toBe('http://example.org/other');
    });
  });
});
