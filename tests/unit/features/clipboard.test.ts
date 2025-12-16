/**
 * Tests for Clipboard utilities
 */

import { ClipboardManager } from '../../../src/features/clipboard';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(),
};

describe('ClipboardManager', () => {
  let clipboardManager: ClipboardManager;
  let originalClipboard: Clipboard | undefined;
  let originalExecCommand: (command: string) => boolean;

  beforeEach(() => {
    clipboardManager = new ClipboardManager();
    
    // Save originals
    originalClipboard = navigator.clipboard;
    originalExecCommand = document.execCommand;
    
    // Reset mocks
    mockClipboard.writeText.mockClear();
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Restore originals
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
    });
    document.execCommand = originalExecCommand;
  });

  describe('copyToClipboard with Clipboard API', () => {
    beforeEach(() => {
      // Mock modern clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });
      
      // Mock document.hasFocus
      document.hasFocus = jest.fn(() => true);
    });

    it('should copy text using Clipboard API', async () => {
      const result = await clipboardManager.copyToClipboard('test text');
      
      expect(result).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('should handle Clipboard API errors and fall back', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Permission denied'));
      
      // Mock execCommand as fallback
      document.execCommand = jest.fn(() => true);
      
      const result = await clipboardManager.copyToClipboard('test text');
      
      expect(mockClipboard.writeText).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should handle document without focus', async () => {
      document.hasFocus = jest.fn(() => false);
      document.execCommand = jest.fn(() => true);
      
      const result = await clipboardManager.copyToClipboard('test text');
      
      // Should use fallback when document doesn't have focus
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('fallbackCopyToClipboard', () => {
    beforeEach(() => {
      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });
    });

    it('should copy using execCommand fallback', async () => {
      document.execCommand = jest.fn(() => true);
      
      const result = await clipboardManager.copyToClipboard('fallback text');
      
      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should handle execCommand failure', async () => {
      document.execCommand = jest.fn(() => false);
      
      const result = await clipboardManager.copyToClipboard('test');
      
      expect(result).toBe(false);
    });

    it('should clean up textarea after copy', async () => {
      document.execCommand = jest.fn(() => true);
      const removeChildSpy = jest.spyOn(document.body, 'removeChild');
      
      await clipboardManager.copyToClipboard('test');
      
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should handle execCommand exceptions', async () => {
      document.execCommand = jest.fn(() => {
        throw new Error('Command failed');
      });
      
      const result = await clipboardManager.copyToClipboard('test');
      
      expect(result).toBe(false);
    });
  });

  describe('formatAsMarkdown', () => {
    it('should format data as markdown table', () => {
      const data = [
        ['Alice', '30', 'Engineer'],
        ['Bob', '25', 'Designer'],
      ];
      const headers = ['Name', 'Age', 'Role'];
      
      const result = clipboardManager.formatAsMarkdown(data, headers);
      
      expect(result).toContain('| Name | Age | Role |');
      expect(result).toContain('| --- | --- | --- |');
      expect(result).toContain('| Alice | 30 | Engineer |');
      expect(result).toContain('| Bob | 25 | Designer |');
    });

    it('should handle data without headers', () => {
      const data = [
        ['value1', 'value2'],
        ['value3', 'value4'],
      ];
      
      const result = clipboardManager.formatAsMarkdown(data);
      
      expect(result).toContain('| value1 | value2 |');
      expect(result).toContain('| value3 | value4 |');
    });

    it('should handle empty data', () => {
      const result = clipboardManager.formatAsMarkdown([]);
      
      expect(result).toBe('');
    });

    it('should include pipe characters in cell values', () => {
      const data = [['value | with | pipes']];
      
      const result = clipboardManager.formatAsMarkdown(data);
      
      // Markdown pipes are included without escaping
      expect(result).toContain('value | with | pipes');
    });

    it('should handle cells with newlines', () => {
      const data = [['line1\nline2']];
      
      const result = clipboardManager.formatAsMarkdown(data);
      
      // Should contain the data
      expect(result).toContain('line1');
    });
  });

  describe('formatAsTSV', () => {
    it('should format data as TSV', () => {
      const data = [
        ['Alice', '30', 'Engineer'],
        ['Bob', '25', 'Designer'],
      ];
      const headers = ['Name', 'Age', 'Role'];
      
      const result = clipboardManager.formatAsTSV(data, headers);
      
      expect(result).toBe('Name\tAge\tRole\nAlice\t30\tEngineer\nBob\t25\tDesigner');
    });

    it('should handle data without headers', () => {
      const data = [
        ['value1', 'value2'],
        ['value3', 'value4'],
      ];
      
      const result = clipboardManager.formatAsTSV(data);
      
      expect(result).toBe('value1\tvalue2\nvalue3\tvalue4');
    });

    it('should handle empty data', () => {
      const result = clipboardManager.formatAsTSV([]);
      
      expect(result).toBe('');
    });

    it('should preserve tabs in cell values', () => {
      const data = [['value\twith\ttabs']];
      
      const result = clipboardManager.formatAsTSV(data);
      
      expect(result).toContain('\t'); // Should preserve tabs
    });
  });
});
