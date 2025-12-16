/**
 * Tests for Blank Node Formatter
 */

import { BnodeFormatter } from '../../../src/formatters/bnode-formatter';

// Mock CellComponent
const createMockCell = (binding: any) => ({
  getValue: () => binding,
}) as any;

describe('BnodeFormatter', () => {
  describe('format', () => {
    it('should format blank node as HTML element', () => {
      const formatter = new BnodeFormatter();
      const cell = createMockCell({ type: 'bnode', value: 'node123' });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result).toBeInstanceOf(HTMLElement);
      expect(result.textContent).toBe('node123');
      expect(result.title).toContain('Blank node');
    });

    it('should handle various blank node IDs', () => {
      const formatter = new BnodeFormatter();
      
      const cell1 = createMockCell({ type: 'bnode', value: 'b0' });
      expect((formatter.format(cell1) as HTMLElement).textContent).toBe('b0');
      
      const cell2 = createMockCell({ type: 'bnode', value: 'genid-123' });
      expect((formatter.format(cell2) as HTMLElement).textContent).toBe('genid-123');
    });

    it('should return empty string for non-bnode bindings', () => {
      const formatter = new BnodeFormatter();
      const cell = createMockCell({ type: 'uri', value: 'http://example.org' });
      
      const result = formatter.format(cell);
      
      expect(result).toBe('');
    });

    it('should handle undefined binding', () => {
      const formatter = new BnodeFormatter();
      const cell = createMockCell(undefined);
      
      const result = formatter.format(cell);
      
      expect(result).toBe('');
    });

    it('should handle empty blank node ID', () => {
      const formatter = new BnodeFormatter();
      const cell = createMockCell({ type: 'bnode', value: '' });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result.textContent).toBe('');
    });

    it('should preserve original blank node ID', () => {
      const formatter = new BnodeFormatter();
      const cell = createMockCell({ type: 'bnode', value: 'node-with-special_chars123' });
      
      const result = formatter.format(cell) as HTMLElement;
      
      expect(result.textContent).toBe('node-with-special_chars123');
    });
  });
});
