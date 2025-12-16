/**
 * Tests for SearchHighlight utilities
 */

import {
  highlightSearchTerm,
  removeHighlighting,
  containsSearchTerm,
} from '../../../src/features/search-highlight';

describe('SearchHighlight', () => {
  describe('highlightSearchTerm', () => {
    it('should highlight exact matches', () => {
      const result = highlightSearchTerm('Hello World', 'World');
      
      expect(result).toBe('Hello <mark class="table-search-highlight">World</mark>');
    });

    it('should be case-insensitive', () => {
      const result = highlightSearchTerm('Hello World', 'world');
      
      expect(result).toBe('Hello <mark class="table-search-highlight">World</mark>');
    });

    it('should highlight multiple occurrences', () => {
      const result = highlightSearchTerm('test test test', 'test');
      
      const matches = (result.match(/<mark class="table-search-highlight">/g) || []).length;
      expect(matches).toBe(3);
    });

    it('should handle partial matches', () => {
      const result = highlightSearchTerm('testing', 'test');
      
      expect(result).toBe('<mark class="table-search-highlight">test</mark>ing');
    });

    it('should escape special regex characters', () => {
      const result = highlightSearchTerm('$100 (USD)', '(USD)');
      
      expect(result).toBe('$100 <mark class="table-search-highlight">(USD)</mark>');
    });

    it('should handle empty search term', () => {
      const result = highlightSearchTerm('Hello World', '');
      
      expect(result).toBe('Hello World');
    });

    it('should handle whitespace-only search term', () => {
      const result = highlightSearchTerm('Hello World', '   ');
      
      expect(result).toBe('Hello World');
    });

    it('should handle special characters in text', () => {
      const text = '<script>alert("XSS")</script>';
      const result = highlightSearchTerm(text, 'script');
      
      expect(result).toContain('<mark class="table-search-highlight">script</mark>');
    });

    it('should handle regex metacharacters in search term', () => {
      const result = highlightSearchTerm('a.b.c', '.');
      
      expect(result).toBe('a<mark class="table-search-highlight">.</mark>b<mark class="table-search-highlight">.</mark>c');
    });

    it('should handle asterisk in search term', () => {
      const result = highlightSearchTerm('var * = 5', '*');
      
      expect(result).toBe('var <mark class="table-search-highlight">*</mark> = 5');
    });

    it('should handle square brackets in search term', () => {
      const result = highlightSearchTerm('array[0]', '[0]');
      
      expect(result).toBe('array<mark class="table-search-highlight">[0]</mark>');
    });

    it('should handle Unicode characters', () => {
      const result = highlightSearchTerm('Hello 世界', '世界');
      
      expect(result).toBe('Hello <mark class="table-search-highlight">世界</mark>');
    });
  });

  describe('removeHighlighting', () => {
    it('should remove single highlight', () => {
      const html = 'Hello <mark class="table-search-highlight">World</mark>';
      const result = removeHighlighting(html);
      
      expect(result).toBe('Hello World');
    });

    it('should remove multiple highlights', () => {
      const html = '<mark class="table-search-highlight">test</mark> <mark class="table-search-highlight">test</mark>';
      const result = removeHighlighting(html);
      
      expect(result).toBe('test test');
    });

    it('should preserve non-highlight content', () => {
      const html = 'Plain text <mark class="table-search-highlight">highlighted</mark> more text';
      const result = removeHighlighting(html);
      
      expect(result).toBe('Plain text highlighted more text');
    });

    it('should handle text without highlights', () => {
      const html = 'No highlights here';
      const result = removeHighlighting(html);
      
      expect(result).toBe('No highlights here');
    });

    it('should handle empty string', () => {
      const result = removeHighlighting('');
      
      expect(result).toBe('');
    });

    it('should preserve other HTML tags', () => {
      const html = '<span>Text</span> <mark class="table-search-highlight">highlighted</mark>';
      const result = removeHighlighting(html);
      
      expect(result).toBe('<span>Text</span> highlighted');
    });

    it('should handle nested content in mark tags', () => {
      const html = '<mark class="table-search-highlight">text with <span>nested</span> content</mark>';
      const result = removeHighlighting(html);
      
      expect(result).toBe('text with <span>nested</span> content');
    });
  });

  describe('containsSearchTerm', () => {
    it('should return true for matching text', () => {
      const result = containsSearchTerm('Hello World', 'World');
      
      expect(result).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result = containsSearchTerm('Hello World', 'world');
      
      expect(result).toBe(true);
    });

    it('should return true for partial matches', () => {
      const result = containsSearchTerm('testing', 'test');
      
      expect(result).toBe(true);
    });

    it('should return false for non-matching text', () => {
      const result = containsSearchTerm('Hello World', 'Goodbye');
      
      expect(result).toBe(false);
    });

    it('should return true for empty search term', () => {
      const result = containsSearchTerm('Hello World', '');
      
      expect(result).toBe(true);
    });

    it('should return true for whitespace-only search term', () => {
      const result = containsSearchTerm('Hello World', '   ');
      
      expect(result).toBe(true);
    });

    it('should trim search term', () => {
      const result = containsSearchTerm('Hello World', '  World  ');
      
      expect(result).toBe(true);
    });

    it('should handle special characters', () => {
      const result = containsSearchTerm('Price: $100', '$100');
      
      expect(result).toBe(true);
    });

    it('should handle Unicode characters', () => {
      const result = containsSearchTerm('你好世界', '世界');
      
      expect(result).toBe(true);
    });
  });
});
