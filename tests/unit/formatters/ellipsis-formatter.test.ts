/**
 * Tests for Ellipsis formatter
 */

import { EllipsisFormatter } from '../../../src/formatters/ellipsis-formatter';

describe('EllipsisFormatter', () => {
  describe('format with default maxLength (50)', () => {
    const formatter = new EllipsisFormatter(true, 50);

    it('should not truncate short strings', () => {
      const result = formatter.format('Short text');
      
      expect(result.display).toBe('Short text');
      expect(result.isTruncated).toBe(false);
    });

    it('should truncate long strings', () => {
      const longText = 'A'.repeat(100);
      const result = formatter.format(longText);
      
      expect(result.display).toHaveLength(53); // 50 + '...'
      expect(result.display.endsWith('...')).toBe(true);
      expect(result.isTruncated).toBe(true);
    });

    it('should truncate at exactly maxLength', () => {
      const text = 'A'.repeat(50);
      const result = formatter.format(text);
      
      expect(result.display).toBe(text);
      expect(result.isTruncated).toBe(false);
    });

    it('should truncate one character over maxLength', () => {
      const text = 'A'.repeat(51);
      const result = formatter.format(text);
      
      expect(result.display).toHaveLength(53);
      expect(result.isTruncated).toBe(true);
    });
  });

  describe('format with custom maxLength', () => {
    it('should respect custom maxLength', () => {
      const formatter = new EllipsisFormatter(true, 10);
      const result = formatter.format('This is a longer text');
      
      expect(result.display).toHaveLength(13); // 10 + '...'
      expect(result.display).toBe('This is a ...');
      expect(result.isTruncated).toBe(true);
    });

    it('should work with very small maxLength', () => {
      const formatter = new EllipsisFormatter(true, 5);
      const result = formatter.format('Hello World');
      
      expect(result.display).toBe('Hello...');
      expect(result.isTruncated).toBe(true);
    });

    it('should work with very large maxLength', () => {
      const formatter = new EllipsisFormatter(true, 1000);
      const text = 'A'.repeat(500);
      const result = formatter.format(text);
      
      expect(result.display).toBe(text);
      expect(result.isTruncated).toBe(false);
    });
  });

  describe('edge cases', () => {
    const formatter = new EllipsisFormatter(true, 50);

    it('should handle empty strings', () => {
      const result = formatter.format('');
      
      expect(result.display).toBe('');
      expect(result.isTruncated).toBe(false);
    });

    it('should handle strings with newlines', () => {
      const text = 'Line 1\nLine 2\nLine 3\n' + 'A'.repeat(100);
      const result = formatter.format(text);
      
      expect(result.isTruncated).toBe(true);
      expect(result.display).toContain('Line 1');
    });

    it('should handle strings with special characters', () => {
      const text = '<>&"\'' + 'A'.repeat(100);
      const result = formatter.format(text);
      
      expect(result.isTruncated).toBe(true);
      expect(result.display).toContain('<>&');
    });

    it('should handle Unicode characters', () => {
      const text = '你好世界' + 'A'.repeat(100);
      const result = formatter.format(text);
      
      expect(result.isTruncated).toBe(true);
      expect(result.display).toContain('你好');
    });
  });
});
