/**
 * Tests for Literal Formatter
 */

import { LiteralFormatter } from '../../../src/formatters/literal-formatter';

// Mock CellComponent
const createMockCell = (binding: any) => ({
  getValue: () => binding,
}) as any;

describe('LiteralFormatter', () => {
  describe('format with showDatatypes enabled', () => {
    it('should display datatype for typed literals', () => {
      const formatter = new LiteralFormatter(true);
      const cell = createMockCell({
        type: 'literal',
        value: '42',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result.textContent).toContain('42');
      expect(result.textContent).toContain('xsd:integer');
    });

    it('should abbreviate XSD datatypes', () => {
      const formatter = new LiteralFormatter(true);
      
      const intCell = createMockCell({
        type: 'literal',
        value: '42',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      });
      expect((formatter.format(intCell) as HTMLElement).textContent).toContain('xsd:integer');
      
      const boolCell = createMockCell({
        type: 'literal',
        value: 'true',
        datatype: 'http://www.w3.org/2001/XMLSchema#boolean',
      });
      expect((formatter.format(boolCell) as HTMLElement).textContent).toContain('xsd:boolean');
    });
  });

  describe('format with language tags', () => {
    it('should display language tag', () => {
      const formatter = new LiteralFormatter(false);
      const cell = createMockCell({
        type: 'literal',
        value: 'Hello',
        'xml:lang': 'en',
      });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result.textContent).toContain('Hello');
      expect(result.textContent).toContain('@en');
    });
  });

  describe('format with showDatatypes disabled', () => {
    it('should not display datatype', () => {
      const formatter = new LiteralFormatter(false);
      const cell = createMockCell({
        type: 'literal',
        value: '42',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result.textContent).toBe('42');
      expect(result.textContent).not.toContain('xsd:');
    });

    it('should display plain literals without annotations', () => {
      const formatter = new LiteralFormatter(false);
      const cell = createMockCell({
        type: 'literal',
        value: 'plain text',
      });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result.textContent).toBe('plain text');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const formatter = new LiteralFormatter(false);
      const cell = createMockCell({
        type: 'literal',
        value: '',
      });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result.textContent).toBe('');
    });

    it('should handle non-literal bindings', () => {
      const formatter = new LiteralFormatter(false);
      const cell = createMockCell({ type: 'uri', value: 'http://example.org' });
      
      const result = formatter.format(cell);
      
      expect(result).toBe('');
    });

    it('should handle undefined binding', () => {
      const formatter = new LiteralFormatter(false);
      const cell = createMockCell(undefined);
      
      const result = formatter.format(cell);
      
      expect(result).toBe('');
    });

    it('should handle special characters', () => {
      const formatter = new LiteralFormatter(false);
      const cell = createMockCell({
        type: 'literal',
        value: '<>&"\'',
      });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result.textContent).toBe('<>&"\'');
    });
  });

  describe('setShowDatatypes', () => {
    it('should update datatype visibility', () => {
      const formatter = new LiteralFormatter(false);
      
      formatter.setShowDatatypes(true);
      
      const cell = createMockCell({
        type: 'literal',
        value: '42',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      });
      
      const result = formatter.format(cell) as HTMLElement;
      expect(result.textContent).toContain('xsd:integer');
    });
  });
});
