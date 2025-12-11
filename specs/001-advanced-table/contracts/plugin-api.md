# Plugin API Contract

**Feature**: Advanced Interactive Table Plugin  
**Date**: 2025-12-11  
**Purpose**: Defines the YASGUI/YASR plugin interface implementation

## Overview

This document specifies the public API that the table plugin exposes to YASGUI/YASR. All methods follow the YASR plugin interface contract defined in [@yasgui/yasr](https://github.com/TriplyDB/YASGUI).

---

## Plugin Interface

### Class: `TablePlugin`

Implements the YASR plugin interface for rendering SPARQL SELECT results as an interactive table.

```typescript
class TablePlugin implements Plugin {
  // Plugin metadata (required by YASR)
  static readonly label: string = 'Table';
  static readonly icon: string = '<svg>...</svg>';
  static readonly priority: number = 10;
  
  // Constructor
  constructor(yasr: Yasr, pluginConfig?: TabulatorPluginConfig);
  
  // Lifecycle methods (required by YASR)
  canHandleResults(): boolean;
  draw(persistentConfig?: PersistentConfig): HTMLElement | void;
  getDownloadInfo(): DownloadInfo;
  destroy(): void;
  
  // Configuration methods
  getConfig(): TabulatorPluginConfig;
  updateConfig(updates: Partial<TabulatorPluginConfig>): void;
  
  // State methods
  getSelection(): SelectionRange | null;
  clearSelection(): void;
  
  // Event methods
  on(event: PluginEvent, handler: Function): void;
  off(event: PluginEvent, handler: Function): void;
}
```

---

## Required Methods (YASR Plugin Interface)

### `canHandleResults(): boolean`

**Purpose**: Determines if the plugin can render the current query results.

**Contract** (FR-037):
- MUST return `true` for SPARQL SELECT queries
- MUST return `false` for CONSTRUCT, ASK, DESCRIBE queries
- MUST check `yasr.results?.head?.vars` array existence

**Implementation Logic**:
```typescript
canHandleResults(): boolean {
  const results = this.yasr.results;
  return !!(
    results &&
    results.head &&
    Array.isArray(results.head.vars) &&
    results.head.vars.length > 0
  );
}
```

**Examples**:
```javascript
// SELECT query → true
{
  head: { vars: ["s", "p", "o"] },
  results: { bindings: [...] }
}

// ASK query → false
{
  boolean: true
}

// CONSTRUCT query → false
{
  "s": {...}, "p": {...}, "o": {...}
}
```

**Performance**: O(1) - Simple object property checks

---

### `draw(persistentConfig?: PersistentConfig): HTMLElement | void`

**Purpose**: Renders the table visualization in the YASR container.

**Parameters**:
- `persistentConfig` (optional): Previously saved plugin state from YASR

**Returns**: 
- `HTMLElement`: Container with rendered table
- `void`: If rendering in-place

**Contract** (FR-001, FR-004, FR-006):
- MUST display all SPARQL bindings in tabular format
- MUST implement virtual scrolling for 10,000+ rows
- MUST render within 2 seconds for 10,000 rows
- MUST include row numbers in first column (FR-018)
- MUST apply user's display configuration
- MUST initialize Tabulator with appropriate formatters

**Implementation Flow**:
```typescript
draw(persistentConfig?: PersistentConfig): HTMLElement {
  // 1. Create container
  const container = document.createElement('div');
  container.className = 'yasgui-table-plugin';
  
  // 2. Load configuration
  const config = this.loadConfiguration(persistentConfig);
  
  // 3. Parse SPARQL results
  const tableData = this.parseResults(this.yasr.results);
  
  // 4. Generate columns
  const columns = this.generateColumns(this.yasr.results.head.vars);
  
  // 5. Initialize Tabulator
  this.table = new Tabulator(container, {
    data: tableData,
    columns: columns,
    layout: 'fitData',
    renderVertical: 'virtual',
    virtualDomBuffer: 300,
    height: '100%',
    ...config.tabulatorOptions
  });
  
  // 6. Attach event handlers
  this.attachEventHandlers();
  
  // 7. Render controls
  this.renderControls(container);
  
  return container;
}
```

**Side Effects**:
- Creates Tabulator instance (stored in `this.table`)
- Attaches DOM event listeners
- Loads preferences from localStorage
- May trigger reflow (performance-sensitive)

**Error Handling**:
```typescript
try {
  return this.renderTable();
} catch (error) {
  console.error('Table rendering failed:', error);
  return this.renderErrorState(error.message);
}
```

---

### `getDownloadInfo(): DownloadInfo`

**Purpose**: Provides download configuration for exporting results.

**Returns**:
```typescript
interface DownloadInfo {
  getData: () => string;
  filename: string;
  contentType: string;
  title: string;
  buttonTitle?: string;
}
```

**Contract** (FR-031, FR-032, FR-033):
- MUST export all result rows (not just visible rows)
- MUST support TSV format (tab-separated values)
- MUST support CSV format (comma-separated values)
- MUST support Markdown format (pipe-separated table)
- MUST generate filename with timestamp

**Implementation**:
```typescript
getDownloadInfo(): DownloadInfo {
  return {
    getData: () => {
      const format = this.config.exportFormat || 'tsv';
      switch (format) {
        case 'csv':
          return this.exportAsCSV();
        case 'markdown':
          return this.exportAsMarkdown();
        default:
          return this.exportAsTSV();
      }
    },
    filename: `sparql-results-${Date.now()}.${this.config.exportFormat || 'tsv'}`,
    contentType: this.getContentType(),
    title: 'Download Table',
    buttonTitle: 'Export as TSV/CSV/Markdown'
  };
}
```

**Export Format Examples**:

**TSV** (default):
```
?person	?name	?age
http://example.org/person/1	Alice	30
http://example.org/person/2	Bob	25
```

**CSV**:
```
"?person","?name","?age"
"http://example.org/person/1","Alice","30"
"http://example.org/person/2","Bob","25"
```

**Markdown**:
```
| ?person | ?name | ?age |
|---------|-------|------|
| http://example.org/person/1 | Alice | 30 |
| http://example.org/person/2 | Bob | 25 |
```

---

### `destroy(): void`

**Purpose**: Cleanup method called when plugin is deactivated or YASR is destroyed.

**Contract**:
- MUST destroy Tabulator instance
- MUST remove all event listeners
- MUST clear selection state
- MUST NOT save state (YASR handles persistence)

**Implementation**:
```typescript
destroy(): void {
  // Destroy Tabulator
  if (this.table) {
    this.table.destroy();
    this.table = null;
  }
  
  // Remove event listeners
  this.eventHandlers.forEach((handler, event) => {
    this.off(event, handler);
  });
  this.eventHandlers.clear();
  
  // Clear selection
  this.selectionRange = null;
  
  // Remove DOM references
  this.container = null;
}
```

**Lifecycle Timing**:
- Called when user switches to different plugin
- Called when YASR instance is destroyed
- Called before re-rendering (implicit destroy + new draw)

---

## Plugin Metadata (Static Properties)

### `label: string`

**Purpose**: Display name in YASR plugin selector.

**Value**: `"Table"`

**Usage**: Shown in YASR UI for plugin selection.

---

### `icon: string`

**Purpose**: SVG icon for plugin selector button.

**Value**:
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M3 3h18v18H3V3zm2 2v4h4V5H5zm6 0v4h4V5h-4zm6 0v4h4V5h-4zM5 11v4h4v-4H5zm6 0v4h4v-4h-4zm6 0v4h4v-4h-4zM5 17v2h4v-2H5zm6 0v2h4v-2h-4zm6 0v2h4v-2h-4z"/>
</svg>
```

**Dimensions**: 24×24 viewBox

---

### `priority: number`

**Purpose**: Determines plugin order in YASR selector.

**Value**: `10`

**Behavior**:
- Higher priority → appears earlier in selector
- Default YASR plugins typically use priority 1-10
- Table plugin priority 10 → appears as primary option

---

## Configuration Methods

### `getConfig(): TabulatorPluginConfig`

**Purpose**: Returns current plugin configuration.

**Returns**: Full configuration object (see [config-schema.md](config-schema.md))

**Contract**:
- MUST return deep copy (prevent external mutation)
- MUST include all default values for undefined properties

**Implementation**:
```typescript
getConfig(): TabulatorPluginConfig {
  return JSON.parse(JSON.stringify({
    ...this.defaultConfig,
    ...this.config
  }));
}
```

---

### `updateConfig(updates: Partial<TabulatorPluginConfig>): void`

**Purpose**: Updates plugin configuration and re-renders table.

**Parameters**:
- `updates`: Partial configuration object with properties to update

**Contract**:
- MUST merge updates with existing config (shallow merge)
- MUST validate configuration (see [config-schema.md](config-schema.md))
- MUST trigger table re-render if necessary
- MUST save to localStorage

**Implementation**:
```typescript
updateConfig(updates: Partial<TabulatorPluginConfig>): void {
  // Validate updates
  const validatedUpdates = this.validateConfig(updates);
  
  // Merge with current config
  this.config = {
    ...this.config,
    ...validatedUpdates
  };
  
  // Save to storage
  this.saveConfiguration();
  
  // Re-render if active
  if (this.table) {
    this.table.setData(this.parseResults(this.yasr.results));
    this.table.redraw(true);
  }
}
```

**Example Usage**:
```javascript
plugin.updateConfig({
  uriDisplayMode: 'full',
  showDatatypes: true,
  ellipsisMode: true
});
```

---

## State Methods

### `getSelection(): SelectionRange | null`

**Purpose**: Returns currently selected cells.

**Returns**: 
- `SelectionRange` object (see [data-model.md](../data-model.md))
- `null` if no selection

**Contract**:
- MUST return selection with `start`, `end`, and `cells` properties
- MUST include actual cell values (not just positions)
- Cell selection enabled per FR-024

**Example Return Value**:
```javascript
{
  start: { row: 0, column: "name" },
  end: { row: 2, column: "age" },
  cells: [
    { position: { row: 0, column: "name" }, value: {...} },
    { position: { row: 0, column: "age" }, value: {...} },
    // ... all cells in range
  ]
}
```

---

### `clearSelection(): void`

**Purpose**: Clears current cell selection.

**Contract**:
- MUST remove visual selection highlights
- MUST reset internal selection state
- MUST emit `selectionCleared` event

**Implementation**:
```typescript
clearSelection(): void {
  this.selectionRange = null;
  this.table.deselectRow(); // Clear Tabulator row selection
  this.emit('selectionCleared');
}
```

---

## Event Methods

### `on(event: PluginEvent, handler: Function): void`

**Purpose**: Registers event listener.

**Parameters**:
- `event`: Event name (see [events.md](events.md))
- `handler`: Callback function

**Supported Events** (see [events.md](events.md) for details):
- `cellClick`
- `cellSelect`
- `rowSelect`
- `search`
- `sort`
- `columnResize`
- `configChange`

**Example Usage**:
```javascript
plugin.on('cellClick', (cell) => {
  console.log('Clicked:', cell.getValue());
});
```

---

### `off(event: PluginEvent, handler: Function): void`

**Purpose**: Removes event listener.

**Parameters**:
- `event`: Event name
- `handler`: Previously registered callback

**Contract**:
- MUST remove only the specific handler
- MUST not error if handler not found

---

## Error Handling

### Error States

**Empty Results**:
```typescript
if (results.results.bindings.length === 0) {
  return this.renderEmptyState();
}
```

**Invalid Results Format**:
```typescript
if (!this.canHandleResults()) {
  throw new Error('TablePlugin: Invalid SPARQL results format');
}
```

**Tabulator Initialization Failure**:
```typescript
try {
  this.table = new Tabulator(container, config);
} catch (error) {
  console.error('Tabulator initialization failed:', error);
  return this.renderErrorState('Table rendering failed');
}
```

---

## Performance Requirements

### Method Performance Targets (FR-006)

| Method | Max Execution Time | Dataset Size |
|--------|-------------------|--------------|
| `canHandleResults()` | <1ms | Any |
| `draw()` | <2s | 10,000 rows |
| `getDownloadInfo().getData()` | <5s | 10,000 rows |
| `destroy()` | <100ms | Any |
| `updateConfig()` | <500ms | Current dataset |

### Optimization Strategies

- Virtual scrolling reduces DOM nodes
- Debounced search (300ms)
- Lazy formatter application
- RequestAnimationFrame for smooth updates

---

## Browser Compatibility

### Required APIs

- ES2018 features (via transpilation)
- localStorage (with fallback to memory-only)
- Clipboard API (with execCommand fallback for FR-027)
- CSS Grid (for layout)

### Polyfills

None required for target browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)

---

## Next Steps

Phase 1 continues with:
1. ✅ **plugin-api.md** (this file) - Complete
2. ⏳ **config-schema.md** - Configuration interface
3. ⏳ **events.md** - Event contracts
