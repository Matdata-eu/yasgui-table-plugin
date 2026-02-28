/**
 * Plugin Configuration Types
 */

export type UriDisplayMode = 'full' | 'abbreviated';
export type EllipsisMode = boolean;

export interface ColumnWidthMap {
  [columnName: string]: number; // width in pixels (50-1000 range)
}

export interface SortState {
  column: string;
  dir: 'asc' | 'desc';
}

export interface DisplayConfiguration {
  uriDisplayMode: UriDisplayMode;
  showDatatypes: boolean;
  ellipsisMode: EllipsisMode;
  columnWidths?: ColumnWidthMap;
  sortState?: SortState;
  lastSearch?: string;
  uriLinkPrefix?: string; // User-configurable prefix URL for URI links (e.g. faceted browser)
}

export interface PrefixMap {
  [prefix: string]: string; // e.g., { "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#" }
}

export type BindingSet = {
  [varName: string]: { type: string; value: string; datatype?: string; 'xml:lang'?: string } | undefined;
};

export interface TabulatorPluginConfig {
  // Display configuration
  displayConfig?: Partial<DisplayConfiguration>;

  // Tabulator pass-through options
  tabulatorOptions?: Record<string, unknown>;

  // Persistence configuration
  persistenceKey?: string; // Default: 'yasgui-table-{pluginId}'
  persistenceEnabled?: boolean; // Default: true

  // Export configuration
  exportFormats?: ('tsv' | 'csv' | 'markdown')[];

  // Theme integration
  themeIntegration?: boolean; // Default: true
  customTheme?: string;

  // Prefix map for URI abbreviation
  prefixMap?: PrefixMap;

  // URI href adapter: transform a URI to a different URL for the link href
  uriHrefAdapter?: (uri: string) => string;

  // Binding set adapter: transform an entire binding set before rendering
  bindingSetAdapter?: (bindingSet: BindingSet) => BindingSet;
}

// Default configuration
export const DEFAULT_CONFIG: Required<Omit<TabulatorPluginConfig, 'customTheme' | 'uriHrefAdapter' | 'bindingSetAdapter'>> = {
  displayConfig: {
    uriDisplayMode: 'full',
    showDatatypes: false,
    ellipsisMode: false,
  },
  tabulatorOptions: {},
  persistenceKey: 'yasgui-table-default',
  persistenceEnabled: true,
  exportFormats: ['tsv', 'csv', 'markdown'],
  themeIntegration: true,
  prefixMap: {},
};
