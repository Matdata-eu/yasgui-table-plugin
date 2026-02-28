/**
 * Configuration Validation Utilities
 */

import { TabulatorPluginConfig, DisplayConfiguration, ColumnWidthMap } from '../types/config';

export const MIN_COLUMN_WIDTH = 50;
export const MAX_COLUMN_WIDTH = 1000;

/**
 * Validates plugin configuration and returns sanitized config
 */
export function validateConfig(config: Partial<TabulatorPluginConfig>): TabulatorPluginConfig {
  const validated: TabulatorPluginConfig = {};

  // Validate display configuration
  if (config.displayConfig) {
    validated.displayConfig = validateDisplayConfig(config.displayConfig);
  }

  // Validate persistence settings
  if (config.persistenceKey !== undefined) {
    validated.persistenceKey =
      typeof config.persistenceKey === 'string' ? config.persistenceKey : 'yasgui-table-default';
  }

  if (config.persistenceEnabled !== undefined) {
    validated.persistenceEnabled = Boolean(config.persistenceEnabled);
  }

  // Validate export formats
  if (config.exportFormats) {
    validated.exportFormats = config.exportFormats.filter((format) =>
      ['tsv', 'csv', 'markdown'].includes(format)
    );
  }

  // Validate theme settings
  if (config.themeIntegration !== undefined) {
    validated.themeIntegration = Boolean(config.themeIntegration);
  }

  if (config.customTheme !== undefined && typeof config.customTheme === 'string') {
    validated.customTheme = config.customTheme;
  }

  // Validate prefix map
  if (config.prefixMap && typeof config.prefixMap === 'object') {
    validated.prefixMap = config.prefixMap;
  }

  // Pass through adapter functions
  if (typeof config.uriHrefAdapter === 'function') {
    validated.uriHrefAdapter = config.uriHrefAdapter;
  }

  if (typeof config.bindingSetAdapter === 'function') {
    validated.bindingSetAdapter = config.bindingSetAdapter;
  }

  // Pass through Tabulator options (assume valid)
  if (config.tabulatorOptions && typeof config.tabulatorOptions === 'object') {
    validated.tabulatorOptions = config.tabulatorOptions;
  }

  return validated;
}

/**
 * Validates display configuration
 */
function validateDisplayConfig(
  config: Partial<DisplayConfiguration>
): Partial<DisplayConfiguration> {
  const validated: Partial<DisplayConfiguration> = {};

  // Validate URI display mode
  if (config.uriDisplayMode) {
    validated.uriDisplayMode = ['full', 'abbreviated'].includes(config.uriDisplayMode)
      ? config.uriDisplayMode
      : 'full';
  }

  // Validate boolean flags
  if (config.showDatatypes !== undefined) {
    validated.showDatatypes = Boolean(config.showDatatypes);
  }

  if (config.ellipsisMode !== undefined) {
    validated.ellipsisMode = Boolean(config.ellipsisMode);
  }

  // Validate column widths
  if (config.columnWidths) {
    validated.columnWidths = validateColumnWidths(config.columnWidths);
  }

  // Validate sort state
  if (config.sortState) {
    if (
      config.sortState.column &&
      typeof config.sortState.column === 'string' &&
      ['asc', 'desc'].includes(config.sortState.dir)
    ) {
      validated.sortState = {
        column: config.sortState.column,
        dir: config.sortState.dir as 'asc' | 'desc',
      };
    }
  }

  // Validate last search
  if (config.lastSearch !== undefined && typeof config.lastSearch === 'string') {
    validated.lastSearch = config.lastSearch;
  }

  return validated;
}

/**
 * Validates column width map
 */
function validateColumnWidths(widths: ColumnWidthMap): ColumnWidthMap {
  const validated: ColumnWidthMap = {};

  for (const [column, width] of Object.entries(widths)) {
    if (typeof width === 'number' && width >= MIN_COLUMN_WIDTH && width <= MAX_COLUMN_WIDTH) {
      validated[column] = width;
    }
  }

  return validated;
}
