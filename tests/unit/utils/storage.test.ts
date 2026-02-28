/**
 * Tests for localStorage utility functions
 */

import { loadDisplayConfig, saveDisplayConfig } from '../../../src/utils/storage';
import { DisplayConfiguration } from '../../../src/types/config';

describe('storage utilities', () => {
  const mockKey = 'test-table-config';
  
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('saveDisplayConfig', () => {
    it('should save config to localStorage', () => {
      const config: DisplayConfiguration = {
        uriDisplayMode: 'abbreviated',
        showDatatypes: true,
        ellipsisMode: false,
        smartFormatters: true,
      };

      saveDisplayConfig(mockKey, config);

      const stored = localStorage.getItem(mockKey);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(config);
    });

    it('should handle storage errors gracefully', () => {
      const config: DisplayConfiguration = {
        uriDisplayMode: 'full',
        showDatatypes: false,
        ellipsisMode: true,
        smartFormatters: true,
      };

      // Mock localStorage.setItem to throw
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage full');
        });

      // Should not throw
      expect(() => saveDisplayConfig(mockKey, config)).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('should overwrite existing config', () => {
      const config1: DisplayConfiguration = {
        uriDisplayMode: 'full',
        showDatatypes: true,
        ellipsisMode: false,
        smartFormatters: true,
      };

      const config2: DisplayConfiguration = {
        uriDisplayMode: 'abbreviated',
        showDatatypes: false,
        ellipsisMode: true,
        smartFormatters: false,
      };

      saveDisplayConfig(mockKey, config1);
      saveDisplayConfig(mockKey, config2);

      const stored = localStorage.getItem(mockKey);
      expect(JSON.parse(stored!)).toEqual(config2);
    });
  });

  describe('loadDisplayConfig', () => {
    it('should load config from localStorage', () => {
      const config: DisplayConfiguration = {
        uriDisplayMode: 'abbreviated',
        showDatatypes: true,
        ellipsisMode: false,
        smartFormatters: true,
      };

      localStorage.setItem(mockKey, JSON.stringify(config));

      const loaded = loadDisplayConfig(mockKey);
      expect(loaded).toEqual(config);
    });

    it('should return null for missing config', () => {
      const loaded = loadDisplayConfig('non-existent-key');
      expect(loaded).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem(mockKey, 'invalid json {');

      const loaded = loadDisplayConfig(mockKey);
      expect(loaded).toBeNull();
    });

    it('should handle storage errors gracefully', () => {
      // Mock localStorage.getItem to throw
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      const loaded = loadDisplayConfig(mockKey);
      expect(loaded).toBeNull();

      getItemSpy.mockRestore();
    });

    it('should load config with optional fields', () => {
      const config: DisplayConfiguration = {
        uriDisplayMode: 'full',
        showDatatypes: false,
        ellipsisMode: true,
        smartFormatters: true,
        columnWidths: { col1: 200, col2: 300 },
        sortState: { column: 'col1', dir: 'asc' },
        lastSearch: 'test query',
      };

      localStorage.setItem(mockKey, JSON.stringify(config));

      const loaded = loadDisplayConfig(mockKey);
      expect(loaded).toEqual(config);
    });
  });
});
