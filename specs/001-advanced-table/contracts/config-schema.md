# Configuration Schema

**Feature**: Advanced Interactive Table Plugin  
**Date**: 2025-12-11  
**Purpose**: Defines plugin configuration interface and validation rules

## Overview

This document specifies the configuration schema for the table plugin, including display options, Tabulator settings, and persistence configuration.

---

## Root Configuration Interface

### `TabulatorPluginConfig`

Main configuration object passed to plugin constructor or `updateConfig()`.

```typescript
interface TabulatorPluginConfig {
  // Display Configuration (User-facing controls)
  displayConfig: DisplayConfiguration;
  
  // Tabulator Configuration (Library options)
  tabulatorOptions?: Partial<TabulatorOptions>;
  
  // Persistence Configuration
  persistenceKey?: string;
  persistenceEnabled?: boolean;
  
  // Export Configuration (FR-029, FR-030, FR-030a)
  // Note: CSV download integrated with YASR's download interface (FR-031)
  exportFormat?: 'tsv' | 'csv' | 'markdown';
  
  // Theme Configuration
  themeIntegration?: boolean;
  customTheme?: string;
  
  // Prefix Configuration (for URI abbreviation)
  // Fetched from YASR's getPrefixes() method and merged with common prefixes
  prefixMap?: PrefixMap;
}
```

**Default Values**:
```typescript
{
  displayConfig: { /* See DisplayConfiguration defaults */ },
  tabulatorOptions: { /* See Tabulator defaults */ },
  persistenceKey: 'yasgui-table-default',
  persistenceEnabled: true,
  exportFormat: 'tsv',
  themeIntegration: true,
  customTheme: undefined,
  prefixMap: {} // Populated from YASR's getPrefixes() merged with COMMON_PREFIXES
}
```

---

## Display Configuration

### `DisplayConfiguration`

User-facing display options (FR-009, FR-010, FR-011, FR-039).

```typescript
interface DisplayConfiguration {
  // URI Display Mode (FR-009)
  uriDisplayMode: 'full' | 'abbreviated';
  
  // Datatype Display (FR-010)
  showDatatypes: boolean;
  
  // Ellipsis Mode (FR-011)
  ellipsisMode: boolean;
  
  // Column State (FR-039)
  columnWidths: ColumnWidthMap;
  
  // Sort State (FR-039)
  sortState: SortState;
  
  // Search State (optional)
  lastSearch?: string;
}
```

#### `uriDisplayMode: 'full' | 'abbreviated'`

**Purpose**: Controls URI rendering in cells (FR-009).

**Values**:
- `'full'`: Display complete URIs (e.g., `http://dbpedia.org/resource/Paris`)
- `'abbreviated'`: Use prefixed form (e.g., `dbr:Paris`)

**Default**: `'abbreviated'`

**Validation**:
```typescript
if (!['full', 'abbreviated'].includes(uriDisplayMode)) {
  throw new Error('uriDisplayMode must be "full" or "abbreviated"');
}
```

**UI Control**: Toggle button in control bar (FR-009)

**Example**:
```javascript
// Full mode
{
  uriDisplayMode: 'full'
}
// Renders: http://dbpedia.org/resource/Paris

// Abbreviated mode
{
  uriDisplayMode: 'abbreviated',
  prefixMap: { dbr: 'http://dbpedia.org/resource/' }
}
// Renders: dbr:Paris
```

---

#### `showDatatypes: boolean`

**Purpose**: Controls datatype annotation display for literals (FR-010).

**Default**: `false`

**Validation**: Must be boolean

**UI Control**: Toggle button in control bar (FR-010)

**Example**:
```javascript
// Hidden (default)
{
  showDatatypes: false
}
// Renders: 42

// Visible
{
  showDatatypes: true
}
// Renders: 42 (xsd:integer)
```

**Rendering Logic**:
```typescript
if (binding.type === 'literal' && binding.datatype && showDatatypes) {
  return `${binding.value} <span class="datatype">(${abbreviateURI(binding.datatype)})</span>`;
}
return binding.value;
```

---

#### `ellipsisMode: boolean`

**Purpose**: Controls content truncation for long values (FR-011).

**Default**: `false`

**Validation**: Must be boolean

**UI Control**: Toggle button in control bar (FR-011)

**Behavior**:
- `true`: Truncate cell content with ellipsis ("…")
- `false`: Display full content (may cause row wrapping)

**Truncation Logic**:
```typescript
if (ellipsisMode && cellValue.length > MAX_CELL_LENGTH) {
  return `${cellValue.slice(0, MAX_CELL_LENGTH)}…`;
}
return cellValue;
```

**Expansion**: Click ellipsized cell → modal/tooltip with full content (FR-013)

---

#### `columnWidths: ColumnWidthMap`

**Purpose**: Persists user-defined column widths (FR-039).

**Type**:
```typescript
interface ColumnWidthMap {
  [columnField: string]: number; // Width in pixels
}
```

**Default**: `{}` (auto-sized columns)

**Example**:
```javascript
{
  columnWidths: {
    "person": 250,
    "name": 150,
    "age": 80
  }
}
```

**Validation**:
```typescript
Object.values(columnWidths).forEach(width => {
  if (typeof width !== 'number' || width < 50 || width > 1000) {
    throw new Error('Column width must be between 50 and 1000 pixels');
  }
});
```

**Update Trigger**: User drags column resize handle (FR-014)

---

#### `sortState: SortState`

**Purpose**: Persists current sort configuration (FR-039).

**Type**:
```typescript
interface SortState {
  column: string | null;     // Column field name
  direction: 'asc' | 'desc' | null;
}
```

**Default**:
```javascript
{
  column: null,
  direction: null
}
```

**Example**:
```javascript
{
  sortState: {
    column: "age",
    direction: "desc"
  }
}
```

**Validation**:
```typescript
if (sortState.direction && !['asc', 'desc'].includes(sortState.direction)) {
  throw new Error('Sort direction must be "asc", "desc", or null');
}
```

**Update Trigger**: User clicks column header (FR-003)

---

#### `lastSearch?: string`

**Purpose**: Optional persistence of last search query.

**Default**: `undefined` (not persisted by default)

**Type**: `string` (search term)

**Example**:
```javascript
{
  lastSearch: "alice"
}
```

**Usage**: Restore search input value on plugin initialization (optional behavior)

---

## Tabulator Configuration

### `tabulatorOptions?: Partial<TabulatorOptions>`

**Purpose**: Pass-through configuration for Tabulator library.

**Type**: `Partial<TabulatorOptions>` (Tabulator's native config interface)

**Common Options**:

```typescript
{
  tabulatorOptions: {
    // Layout
    layout: 'fitData' | 'fitColumns' | 'fitDataFill',
    height: string | number,          // e.g., "100%", 500
    maxHeight: number,
    
    // Virtual Scrolling (FR-004)
    renderVertical: 'virtual',
    virtualDomBuffer: number,         // Rows to render off-screen
    
    // Sorting
    headerSort: boolean,              // Enable column sorting
    initialSort: SortDefinition[],
    
    // Responsiveness
    responsiveLayout: 'hide' | 'collapse',
    
    // Pagination (not used - conflicts with virtual scrolling)
    pagination: false
  }
}
```

**Defaults** (set by plugin):
```javascript
{
  layout: 'fitData',
  height: '100%',  // Not maxHeight to avoid resize loops
  renderVertical: 'virtual',
  virtualDomBuffer: 300,
  headerSort: true,
  pagination: false
}
```

**Note**: Using `maxHeight: '100%'` with virtual scrolling causes infinite resize loops. Always use `height: '100%'` instead.

**Validation**: Delegated to Tabulator library (will throw if invalid)

**Override Warning**: Setting `pagination: true` will disable virtual scrolling and may violate performance requirements (FR-004, FR-006).

---

## Persistence Configuration

### `persistenceKey?: string`

**Purpose**: localStorage key for saving display configuration.

**Default**: `'yasgui-table-default'`

**Validation**:
```typescript
if (typeof persistenceKey !== 'string' || persistenceKey.length === 0) {
  throw new Error('persistenceKey must be a non-empty string');
}
```

**Usage**:
```javascript
const storageKey = `${config.persistenceKey}:display-config`;
localStorage.setItem(storageKey, JSON.stringify(displayConfig));
```

**Custom Keys** (multi-instance scenarios):
```javascript
{
  persistenceKey: 'yasgui-table-instance-1'
}
```

---

### `persistenceEnabled?: boolean`

**Purpose**: Enables/disables localStorage persistence.

**Default**: `true`

**Validation**: Must be boolean

**Behavior**:
- `true`: Save displayConfig to localStorage on changes
- `false`: Use in-memory config only (resets on page reload)

**Use Case**: Disable for privacy-sensitive environments

---

## Export Configuration

### `exportFormat?: 'tsv' | 'csv' | 'markdown'`

**Purpose**: Default export format for `getDownloadInfo()` (FR-031, FR-032, FR-033).

**Default**: `'tsv'`

**Values**:
- `'tsv'`: Tab-separated values (FR-031)
- `'csv'`: Comma-separated values (FR-032)
- `'markdown'`: Markdown table format (FR-033)

**Validation**:
```typescript
if (!['tsv', 'csv', 'markdown'].includes(exportFormat)) {
  throw new Error('exportFormat must be "tsv", "csv", or "markdown"');
}
```

**UI Integration**: May be selectable via export dropdown (future enhancement)

---

## Theme Configuration

### `themeIntegration?: boolean`

**Purpose**: Enables automatic theme synchronization with YASGUI.

**Default**: `true`

**Behavior**:
- `true`: Apply YASGUI theme CSS variables to table
- `false`: Use default Tabulator theme

**CSS Variable Bridge** (when enabled):
```css
.yasgui-table-plugin {
  --table-bg: var(--yasgui-bg);
  --table-text: var(--yasgui-text);
  --table-border: var(--yasgui-border);
  --table-hover: var(--yasgui-hover);
}
```

**Clarification Decision** (from spec.md):
> "Use theme-responsive styling via CSS variables (--search-highlight-color) that adapts to light/dark themes"

---

### `customTheme?: string`

**Purpose**: Override with custom theme CSS class.

**Default**: `undefined` (no override)

**Type**: `string` (CSS class name)

**Example**:
```javascript
{
  themeIntegration: false,
  customTheme: 'my-custom-table-theme'
}
```

**Usage**:
```typescript
if (config.customTheme) {
  container.classList.add(config.customTheme);
}
```

---

## Prefix Configuration

### `prefixMap?: PrefixMap`

**Purpose**: Namespace-to-prefix mappings for URI abbreviation (FR-009).

**Type**:
```typescript
interface PrefixMap {
  [prefix: string]: string;  // prefix → namespace URI
}
```

**Default**: `{}` (empty, populated from YASQE if available)

**Example**:
```javascript
{
  prefixMap: {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "dbr": "http://dbpedia.org/resource/",
    "dbo": "http://dbpedia.org/ontology/"
  }
}
```

**Population from YASQE**:
```typescript
const yasqe = yasr.getYasqe();
if (yasqe && typeof yasqe.getPrefixes === 'function') {
  config.prefixMap = yasqe.getPrefixes();
}
```

**Validation**:
```typescript
Object.entries(prefixMap).forEach(([prefix, namespace]) => {
  if (typeof prefix !== 'string' || typeof namespace !== 'string') {
    throw new Error('Prefix map must contain string key-value pairs');
  }
  if (!namespace.startsWith('http://') && !namespace.startsWith('https://')) {
    console.warn(`Invalid namespace URI: ${namespace}`);
  }
});
```

---

## Configuration Validation

### Validation Function

```typescript
function validateConfig(config: Partial<TabulatorPluginConfig>): void {
  // Display Config
  if (config.displayConfig) {
    const dc = config.displayConfig;
    
    if (dc.uriDisplayMode && !['full', 'abbreviated'].includes(dc.uriDisplayMode)) {
      throw new Error('Invalid uriDisplayMode');
    }
    
    if (dc.showDatatypes !== undefined && typeof dc.showDatatypes !== 'boolean') {
      throw new Error('showDatatypes must be boolean');
    }
    
    if (dc.ellipsisMode !== undefined && typeof dc.ellipsisMode !== 'boolean') {
      throw new Error('ellipsisMode must be boolean');
    }
    
    if (dc.columnWidths) {
      Object.values(dc.columnWidths).forEach(width => {
        if (typeof width !== 'number' || width < 50 || width > 1000) {
          throw new Error('Column width out of range');
        }
      });
    }
    
    if (dc.sortState?.direction && !['asc', 'desc'].includes(dc.sortState.direction)) {
      throw new Error('Invalid sort direction');
    }
  }
  
  // Export Format
  if (config.exportFormat && !['tsv', 'csv', 'markdown'].includes(config.exportFormat)) {
    throw new Error('Invalid exportFormat');
  }
  
  // Persistence
  if (config.persistenceKey && typeof config.persistenceKey !== 'string') {
    throw new Error('persistenceKey must be string');
  }
  
  if (config.persistenceEnabled !== undefined && typeof config.persistenceEnabled !== 'boolean') {
    throw new Error('persistenceEnabled must be boolean');
  }
  
  // Theme
  if (config.themeIntegration !== undefined && typeof config.themeIntegration !== 'boolean') {
    throw new Error('themeIntegration must be boolean');
  }
}
```

---

## Configuration Examples

### Minimal Configuration

```javascript
// Uses all defaults
const plugin = new TablePlugin(yasr);
```

### Custom Display Options

```javascript
const plugin = new TablePlugin(yasr, {
  displayConfig: {
    uriDisplayMode: 'full',
    showDatatypes: true,
    ellipsisMode: true
  }
});
```

### Performance-Optimized Configuration

```javascript
const plugin = new TablePlugin(yasr, {
  tabulatorOptions: {
    virtualDomBuffer: 500,   // Larger buffer for smoother scrolling
    layout: 'fitData'        // Minimize reflows
  }
});
```

### Multi-Instance Configuration

```javascript
const plugin1 = new TablePlugin(yasr1, {
  persistenceKey: 'yasgui-table-query-1'
});

const plugin2 = new TablePlugin(yasr2, {
  persistenceKey: 'yasgui-table-query-2'
});
```

### No Persistence Configuration

```javascript
const plugin = new TablePlugin(yasr, {
  persistenceEnabled: false  // No localStorage usage
});
```

---

## Configuration Update Flow

### User Interaction → Configuration Update

```
User clicks "URI Display" toggle
  ↓
UI component calls plugin.updateConfig({
  displayConfig: { uriDisplayMode: 'full' }
})
  ↓
Plugin validates configuration
  ↓
Plugin merges with existing config
  ↓
Plugin saves to localStorage (if enabled)
  ↓
Plugin re-renders table with new config
  ↓
UI updates toggle state
```

### Persistence Flow

```
Plugin.updateConfig() called
  ↓
Check config.persistenceEnabled === true
  ↓
Generate storage key: `${config.persistenceKey}:display-config`
  ↓
Serialize displayConfig to JSON
  ↓
localStorage.setItem(key, json)
  ↓
Handle storage quota errors (fallback to memory-only)
```

---

## Type Definitions Summary

```typescript
// Root configuration
interface TabulatorPluginConfig {
  displayConfig: DisplayConfiguration;
  tabulatorOptions?: Partial<TabulatorOptions>;
  persistenceKey?: string;
  persistenceEnabled?: boolean;
  exportFormat?: 'tsv' | 'csv' | 'markdown';
  themeIntegration?: boolean;
  customTheme?: string;
  prefixMap?: PrefixMap;
}

// Display configuration
interface DisplayConfiguration {
  uriDisplayMode: 'full' | 'abbreviated';
  showDatatypes: boolean;
  ellipsisMode: boolean;
  columnWidths: ColumnWidthMap;
  sortState: SortState;
  lastSearch?: string;
}

// Supporting types
interface ColumnWidthMap { [field: string]: number }
interface SortState { column: string | null; direction: 'asc' | 'desc' | null }
interface PrefixMap { [prefix: string]: string }
```

---

## Next Steps

Phase 1 continues with:
1. ✅ **config-schema.md** (this file) - Complete
2. ⏳ **events.md** - Event contracts
