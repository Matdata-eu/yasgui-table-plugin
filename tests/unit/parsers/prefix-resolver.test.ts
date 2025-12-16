/**
 * Tests for PrefixResolver
 */

import { PrefixResolver } from '../../../src/parsers/prefix-resolver';

describe('PrefixResolver', () => {
  describe('abbreviate with custom prefixes', () => {
    const customPrefixes = {
      ex: 'http://example.org/',
      custom: 'http://custom.org/vocab#',
    };
    const resolver = new PrefixResolver(customPrefixes);

    it('should abbreviate URI with custom prefix', () => {
      const result = resolver.abbreviate('http://example.org/resource');
      expect(result).toBe('ex:resource');
    });

    it('should abbreviate URI with hash separator', () => {
      const result = resolver.abbreviate('http://custom.org/vocab#term');
      expect(result).toBe('custom:term');
    });

    it('should return local name if no matching prefix', () => {
      const result = resolver.abbreviate('http://unknown.org/resource');
      expect(result).toBe('resource');
    });

    it('should handle URIs with fragments', () => {
      const result = resolver.abbreviate('http://example.org/resource#id');
      expect(result).toBe('ex:resource#id');
    });
  });

  describe('abbreviate with common prefixes', () => {
    const resolver = new PrefixResolver({});

    it('should abbreviate RDF URIs', () => {
      expect(resolver.abbreviate('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'))
        .toBe('rdf:type');
    });

    it('should abbreviate RDFS URIs', () => {
      expect(resolver.abbreviate('http://www.w3.org/2000/01/rdf-schema#label'))
        .toBe('rdfs:label');
    });

    it('should abbreviate XSD URIs', () => {
      expect(resolver.abbreviate('http://www.w3.org/2001/XMLSchema#integer'))
        .toBe('xsd:integer');
    });

    it('should abbreviate FOAF URIs', () => {
      expect(resolver.abbreviate('http://xmlns.com/foaf/0.1/Person'))
        .toBe('foaf:Person');
    });

    it('should abbreviate OWL URIs', () => {
      expect(resolver.abbreviate('http://www.w3.org/2002/07/owl#Class'))
        .toBe('owl:Class');
    });
  });

  describe('abbreviate with merged prefixes', () => {
    const customPrefixes = {
      ex: 'http://example.org/',
      rdf: 'http://custom-rdf.org/', // Override common prefix
    };
    const resolver = new PrefixResolver(customPrefixes);

    it('should prefer custom prefix over common prefix', () => {
      const result = resolver.abbreviate('http://custom-rdf.org/type');
      expect(result).toBe('rdf:type');
    });

    it('should still use common prefixes for non-overridden', () => {
      const result = resolver.abbreviate('http://www.w3.org/2000/01/rdf-schema#label');
      expect(result).toBe('rdfs:label');
    });
  });

  describe('expand', () => {
    const customPrefixes = {
      ex: 'http://example.org/',
      custom: 'http://custom.org/vocab#',
    };
    const resolver = new PrefixResolver(customPrefixes);

    it('should expand prefixed name with custom prefix', () => {
      const result = resolver.expand('ex:resource');
      expect(result).toBe('http://example.org/resource');
    });

    it('should expand prefixed name with common prefix', () => {
      const result = resolver.expand('rdf:type');
      expect(result).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    });

    it('should return original if not a prefixed name', () => {
      const result = resolver.expand('http://example.org/full-uri');
      expect(result).toBe('http://example.org/full-uri');
    });

    it('should return original if prefix unknown', () => {
      const result = resolver.expand('unknown:term');
      expect(result).toBe('unknown:term');
    });

    it('should handle empty local name', () => {
      const result = resolver.expand('ex:');
      expect(result).toBe('http://example.org/');
    });

    it('should handle no colon', () => {
      const result = resolver.expand('nocolon');
      expect(result).toBe('nocolon');
    });
  });

  describe('addPrefix', () => {
    const resolver = new PrefixResolver({ ex: 'http://example.org/' });

    it('should add new prefix', () => {
      resolver.addPrefix('new', 'http://new.org/');
      
      const result = resolver.abbreviate('http://new.org/resource');
      expect(result).toBe('new:resource');
    });

    it('should override existing prefix', () => {
      resolver.addPrefix('ex', 'http://different.org/');
      
      const result = resolver.abbreviate('http://different.org/resource');
      expect(result).toBe('ex:resource');
    });
  });

  describe('getPrefixes', () => {
    it('should return all prefixes', () => {
      const customPrefixes = { ex: 'http://example.org/' };
      const resolver = new PrefixResolver(customPrefixes);
      
      const prefixes = resolver.getPrefixes();
      
      expect(prefixes.ex).toBe('http://example.org/');
      expect(prefixes.rdf).toBeDefined(); // Common prefix
      expect(prefixes.foaf).toBeDefined(); // Common prefix
    });

    it('should return a copy', () => {
      const resolver = new PrefixResolver({});
      const prefixes1 = resolver.getPrefixes();
      const prefixes2 = resolver.getPrefixes();
      
      expect(prefixes1).not.toBe(prefixes2); // Different objects
    });
  });

  describe('edge cases', () => {
    const resolver = new PrefixResolver({});

    it('should handle empty URI', () => {
      expect(resolver.abbreviate('')).toBe('');
    });

    it('should handle URIs without path', () => {
      // Returns local name when no slash/hash found
      expect(resolver.abbreviate('http://example.org')).toBe('example.org');
    });

    it('should extract local name from unknown namespace', () => {
      const result = resolver.abbreviate('http://example.org/path/to/resource');
      expect(result).toBe('resource');
    });
  });
});
