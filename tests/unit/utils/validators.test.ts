/**
 * Tests for config validators
 */

import { validateConfig } from '../../../src/utils/validators';
import { TabulatorPluginConfig } from '../../../src/types/config';

describe('validateConfig', () => {
  it('should accept valid config', () => {
    const config: Partial<TabulatorPluginConfig> = {
      displayConfig: {
        uriDisplayMode: 'abbreviated',
        showDatatypes: true,
        ellipsisMode: false,
      },
      persistenceEnabled: true,
      persistenceKey: 'test-key',
    };

    const result = validateConfig(config);
    expect(result).toEqual(config);
  });

  it('should handle empty config', () => {
    const result = validateConfig({});
    expect(result).toEqual({});
  });

  it('should fallback invalid displayConfig values to defaults', () => {
    const config: any = {
      displayConfig: {
        uriDisplayMode: 'invalid-mode',
        showDatatypes: true,
        ellipsisMode: false,
      },
    };

    const result = validateConfig(config);
    expect(result.displayConfig?.uriDisplayMode).toBe('full');
  });

  it('should accept "full" uriDisplayMode', () => {
    const config: Partial<TabulatorPluginConfig> = {
      displayConfig: {
        uriDisplayMode: 'full',
        showDatatypes: false,
        ellipsisMode: true,
      },
    };

    const result = validateConfig(config);
    expect(result.displayConfig?.uriDisplayMode).toBe('full');
  });

  it('should accept "abbreviated" uriDisplayMode', () => {
    const config: Partial<TabulatorPluginConfig> = {
      displayConfig: {
        uriDisplayMode: 'abbreviated',
        showDatatypes: false,
        ellipsisMode: true,
      },
    };

    const result = validateConfig(config);
    expect(result.displayConfig?.uriDisplayMode).toBe('abbreviated');
  });

  it('should coerce invalid boolean fields to boolean', () => {
    const config: any = {
      displayConfig: {
        uriDisplayMode: 'full',
        showDatatypes: 'not-a-boolean',
        ellipsisMode: false,
      },
    };

    const result = validateConfig(config);
    expect(typeof result.displayConfig?.showDatatypes).toBe('boolean');
  });

  it('should coerce persistenceEnabled to boolean', () => {
    const config: any = {
      persistenceEnabled: 'yes',
    };

    const result = validateConfig(config);
    expect(typeof result.persistenceEnabled).toBe('boolean');
  });

  it('should accept valid persistenceKey string', () => {
    const config: any = {
      persistenceKey: 'valid-key',
    };

    const result = validateConfig(config);
    expect(result.persistenceKey).toBe('valid-key');
  });

  it('should accept config with optional fields', () => {
    const config: Partial<TabulatorPluginConfig> = {
      displayConfig: {
        uriDisplayMode: 'full',
        showDatatypes: true,
        ellipsisMode: false,
        columnWidths: { col1: 200 },
        sortState: { column: 'col1', dir: 'desc' },
      },
      prefixMap: { foaf: 'http://xmlns.com/foaf/0.1/' },
    };

    const result = validateConfig(config);
    expect(result).toEqual(config);
  });
});
