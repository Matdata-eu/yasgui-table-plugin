# Event Contracts

**Feature**: Advanced Interactive Table Plugin  
**Date**: 2025-12-11  
**Purpose**: Defines plugin event system for external integrations

## Overview

This document specifies the event API that allows external code to listen to plugin interactions. Events follow the standard EventEmitter pattern.

---

## Event System

### Event Registration

```typescript
// Register listener
plugin.on(eventName: string, handler: Function): void

// Remove listener
plugin.off(eventName: string, handler: Function): void

// One-time listener
plugin.once(eventName: string, handler: Function): void
```

### Event Object Structure

All events emit an object with common properties:

```typescript
interface BaseEvent {
  type: string;           // Event name
  timestamp: number;      // Event time (Date.now())
  plugin: TablePlugin;    // Plugin instance reference
}
```

---

## Cell Events

### `cellClick`

**Fired**: When user clicks a table cell (FR-024).

**Event Object**:
```typescript
interface CellClickEvent extends BaseEvent {
  type: 'cellClick';
  cell: CellComponent;    // Tabulator cell instance
  position: CellPosition; // { row: number, column: string }
  value: SparqlBinding;   // Cell binding value
  event: MouseEvent;      // Original DOM event
}
```

**Example**:
```javascript
plugin.on('cellClick', (e) => {
  console.log(`Clicked cell at row ${e.position.row}, column ${e.position.column}`);
  console.log('Value:', e.value);
});
```

**Timing**: Fired immediately after click, before selection update

**Cancellation**: Not cancellable (use event.event.preventDefault() for DOM cancellation)

---

### `cellDoubleClick`

**Fired**: When user double-clicks a cell.

**Event Object**:
```typescript
interface CellDoubleClickEvent extends BaseEvent {
  type: 'cellDoubleClick';
  cell: CellComponent;
  position: CellPosition;
  value: SparqlBinding;
  event: MouseEvent;
}
```

**Use Case**: Trigger modal for ellipsized content (FR-013)

**Example**:
```javascript
plugin.on('cellDoubleClick', (e) => {
  if (plugin.config.displayConfig.ellipsisMode) {
    showFullContentModal(e.value);
  }
});
```

---

### `cellSelect`

**Fired**: When cell selection changes (FR-024, FR-025).

**Event Object**:
```typescript
interface CellSelectEvent extends BaseEvent {
  type: 'cellSelect';
  selection: SelectionRange;  // Current selection state
  added: SelectedCell[];      // Newly selected cells
  removed: SelectedCell[];    // Deselected cells
}
```

**Selection Range**:
```typescript
interface SelectionRange {
  start: CellPosition;
  end: CellPosition;
  cells: SelectedCell[];
}

interface SelectedCell {
  position: CellPosition;
  value: SparqlBinding;
}
```

**Example**:
```javascript
plugin.on('cellSelect', (e) => {
  console.log(`Selected ${e.selection.cells.length} cells`);
  console.log('Selection range:', e.selection.start, '→', e.selection.end);
});
```

**Trigger Conditions**:
- Single cell click
- Shift+Click range selection (FR-025)
- Keyboard navigation (arrow keys)
- Programmatic selection

---

### `selectionCleared`

**Fired**: When cell selection is cleared.

**Event Object**:
```typescript
interface SelectionClearedEvent extends BaseEvent {
  type: 'selectionCleared';
  previousSelection: SelectionRange;  // Last selection before clear
}
```

**Example**:
```javascript
plugin.on('selectionCleared', (e) => {
  console.log('Selection cleared');
});
```

**Trigger Conditions**:
- Click outside table
- Escape key pressed
- New query results loaded
- `plugin.clearSelection()` called

---

## Row Events

### `rowClick`

**Fired**: When user clicks row number cell (FR-026).

**Event Object**:
```typescript
interface RowClickEvent extends BaseEvent {
  type: 'rowClick';
  row: RowComponent;      // Tabulator row instance
  rowIndex: number;       // Row index (0-based)
  rowData: TableRow;      // Full row data
  event: MouseEvent;
}
```

**Example**:
```javascript
plugin.on('rowClick', (e) => {
  console.log(`Row ${e.rowIndex} clicked`);
  console.log('Row data:', e.rowData);
});
```

**Behavior**: Clicking row number selects entire row (FR-026)

---

### `rowSelect`

**Fired**: When entire row is selected (FR-026).

**Event Object**:
```typescript
interface RowSelectEvent extends BaseEvent {
  type: 'rowSelect';
  row: RowComponent;
  rowIndex: number;
  rowData: TableRow;
  selection: SelectionRange;  // All cells in row
}
```

**Example**:
```javascript
plugin.on('rowSelect', (e) => {
  console.log(`Row ${e.rowIndex} selected`);
  console.log(`${e.selection.cells.length} cells selected`);
});
```

---

## Column Events

### `columnSort`

**Fired**: When user sorts by column (FR-003).

**Event Object**:
```typescript
interface ColumnSortEvent extends BaseEvent {
  type: 'columnSort';
  column: ColumnComponent;  // Tabulator column instance
  field: string;            // Column field name
  direction: 'asc' | 'desc';
  previousSort: SortState;  // Previous sort configuration
}
```

**Example**:
```javascript
plugin.on('columnSort', (e) => {
  console.log(`Sorted by ${e.field} (${e.direction})`);
});
```

**Timing**: Fired after sort is applied, before table re-render

**Persistence**: Sort state saved to localStorage (FR-039)

---

### `columnResize`

**Fired**: When user resizes column (FR-014).

**Event Object**:
```typescript
interface ColumnResizeEvent extends BaseEvent {
  type: 'columnResize';
  column: ColumnComponent;
  field: string;
  width: number;          // New width in pixels
  previousWidth: number;  // Previous width
}
```

**Example**:
```javascript
plugin.on('columnResize', (e) => {
  console.log(`Column ${e.field} resized: ${e.previousWidth}px → ${e.width}px`);
});
```

**Timing**: Fired after resize drag completes (on mouseup)

**Persistence**: Width saved to displayConfig.columnWidths (FR-039)

**Performance**: Debounced during drag (fires once per drag operation, not per pixel)

---

## Search Events

### `search`

**Fired**: When search filter is applied (FR-019).

**Event Object**:
```typescript
interface SearchEvent extends BaseEvent {
  type: 'search';
  searchTerm: string;     // Current search query
  matchCount: number;     // Number of matching rows
  totalRows: number;      // Total rows in dataset
  previousTerm: string;   // Previous search term
}
```

**Example**:
```javascript
plugin.on('search', (e) => {
  console.log(`Search: "${e.searchTerm}" - ${e.matchCount}/${e.totalRows} rows`);
});
```

**Timing**: Fired after debounce (300ms) and after filter applied

**Performance**: Debounced to avoid excessive events during typing

---

### `searchHighlight`

**Fired**: When search term is highlighted in cells (FR-020).

**Event Object**:
```typescript
interface SearchHighlightEvent extends BaseEvent {
  type: 'searchHighlight';
  searchTerm: string;
  highlightedCells: number;  // Number of cells with highlights
}
```

**Example**:
```javascript
plugin.on('searchHighlight', (e) => {
  console.log(`Highlighted "${e.searchTerm}" in ${e.highlightedCells} cells`);
});
```

**Timing**: Fired after highlight markup applied to visible cells

---

## Configuration Events

### `configChange`

**Fired**: When plugin configuration is updated.

**Event Object**:
```typescript
interface ConfigChangeEvent extends BaseEvent {
  type: 'configChange';
  changes: Partial<TabulatorPluginConfig>;  // Changed properties
  config: TabulatorPluginConfig;            // Full current config
  previousConfig: TabulatorPluginConfig;    // Config before update
}
```

**Example**:
```javascript
plugin.on('configChange', (e) => {
  if (e.changes.displayConfig?.uriDisplayMode) {
    console.log('URI display mode changed to:', e.changes.displayConfig.uriDisplayMode);
  }
});
```

**Trigger Conditions**:
- `plugin.updateConfig()` called
- User clicks control toggle (URI display, datatypes, ellipsis)
- Column resize or sort (updates displayConfig)

---

## Copy Events

### `copy`

**Fired**: When user copies table data to clipboard (FR-029, FR-030, FR-030a).

**Event Object**:
```typescript
interface CopyEvent extends BaseEvent {
  type: 'copy';
  format: 'tsv' | 'csv' | 'markdown';
  rowCount: number;       // Number of copied rows
  columnCount: number;    // Number of copied columns
  dataSize: number;       // Size of copied data (bytes)
  success: boolean;       // Whether copy succeeded
}
```

**Example**:
```javascript
plugin.on('copy', (e) => {
  if (e.success) {
    console.log(`Copied ${e.rowCount} rows as ${e.format} (${e.dataSize} bytes)`);
  }
});
```

**Timing**: Fired after copy operation completes

**Notifications**: Visual notification shown to user on success/failure

---

### `clipboard`

**Fired**: When selection is copied to clipboard (FR-027, FR-028).

**Event Object**:
```typescript
interface ClipboardEvent extends BaseEvent {
  type: 'clipboard';
  selection: SelectionRange;
  format: 'text/plain' | 'text/html';
  dataSize: number;       // Size of copied data (bytes)
  success: boolean;       // Whether copy succeeded
}
```

**Example**:
```javascript
plugin.on('clipboard', (e) => {
  if (e.success) {
    console.log(`Copied ${e.selection.cells.length} cells to clipboard`);
  } else {
    console.error('Clipboard copy failed');
  }
});
```

**Trigger Conditions**:
- Ctrl+C / Cmd+C with selection (FR-027)
- Click "Copy" button (if implemented)

**Browser Compatibility**: May fail in insecure contexts (non-HTTPS). Fallback to execCommand provided.

**Notifications**: Visual notification shown to user on success/failure

---

## Lifecycle Events

### `ready`

**Fired**: When table is fully rendered and interactive.

**Event Object**:
```typescript
interface ReadyEvent extends BaseEvent {
  type: 'ready';
  rowCount: number;
  columnCount: number;
  renderTime: number;     // Time from draw() call to ready (ms)
}
```

**Example**:
```javascript
plugin.on('ready', (e) => {
  console.log(`Table rendered: ${e.rowCount} rows, ${e.columnCount} columns`);
  console.log(`Render time: ${e.renderTime}ms`);
});
```

**Timing**: Fired after Tabulator initialization complete and first render

**Performance**: Useful for measuring render performance (FR-006)

---

### `destroy`

**Fired**: When plugin is destroyed.

**Event Object**:
```typescript
interface DestroyEvent extends BaseEvent {
  type: 'destroy';
  reason: 'plugin-switch' | 'yasr-destroy' | 'manual';
}
```

**Example**:
```javascript
plugin.on('destroy', (e) => {
  console.log(`Plugin destroyed: ${e.reason}`);
  // Cleanup external resources
});
```

**Timing**: Fired during `plugin.destroy()` execution, before cleanup

**Use Case**: Cleanup external integrations or analytics

---

## Error Events

### `error`

**Fired**: When plugin encounters an error.

**Event Object**:
```typescript
interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: Error;           // Error object
  context: string;        // Where error occurred
  recoverable: boolean;   // Whether plugin can continue
}
```

**Example**:
```javascript
plugin.on('error', (e) => {
  console.error(`Plugin error in ${e.context}:`, e.error);
  if (!e.recoverable) {
    alert('Table plugin encountered a fatal error');
  }
});
```

**Error Contexts**:
- `'initialization'`: Tabulator creation failed
- `'render'`: Cell formatter error
- `'clipboard'`: Clipboard API error
- `'storage'`: localStorage access error
- `'export'`: Export generation error

---

## Event Usage Patterns

### Progress Tracking

```javascript
let renderStartTime;

plugin.on('configChange', () => {
  renderStartTime = Date.now();
});

plugin.on('ready', (e) => {
  const duration = Date.now() - renderStartTime;
  console.log(`Re-render completed in ${duration}ms`);
});
```

### Analytics Integration

```javascript
plugin.on('search', (e) => {
  analytics.track('Table Search', {
    term: e.searchTerm,
    results: e.matchCount
  });
});

plugin.on('copy', (e) => {
  analytics.track('Table Copy', {
    format: e.format,
    rows: e.rowCount,
    success: e.success
  });
});
```

### Custom UI Sync

```javascript
plugin.on('cellSelect', (e) => {
  updateCustomSelectionInfo(e.selection);
});

plugin.on('columnSort', (e) => {
  updateSortIndicator(e.field, e.direction);
});
```

### Error Handling

```javascript
plugin.on('error', (e) => {
  if (e.context === 'clipboard') {
    showNotification('Clipboard access denied. Please check browser permissions.');
  }
  
  if (!e.recoverable) {
    showFatalErrorDialog(e.error.message);
  }
});
```

---

## Performance Considerations

### Event Throttling

High-frequency events are automatically throttled:

- `columnResize`: Fires once per drag operation (not per pixel)
- `search`: Debounced 300ms
- `searchHighlight`: Fires after render complete (not per cell)

### Event Handler Best Practices

```javascript
// ❌ Bad: Heavy synchronous processing
plugin.on('cellClick', (e) => {
  expensiveOperation(e.value); // Blocks UI
});

// ✅ Good: Async processing
plugin.on('cellClick', async (e) => {
  await expensiveOperation(e.value);
});

// ✅ Good: Debounced handler
const debouncedHandler = debounce((e) => {
  expensiveOperation(e.value);
}, 300);
plugin.on('cellClick', debouncedHandler);
```

---

## Type Definitions Summary

```typescript
// Base event
interface BaseEvent {
  type: string;
  timestamp: number;
  plugin: TablePlugin;
}

// Cell events
interface CellClickEvent extends BaseEvent { cell, position, value, event }
interface CellDoubleClickEvent extends BaseEvent { cell, position, value, event }
interface CellSelectEvent extends BaseEvent { selection, added, removed }
interface SelectionClearedEvent extends BaseEvent { previousSelection }

// Row events
interface RowClickEvent extends BaseEvent { row, rowIndex, rowData, event }
interface RowSelectEvent extends BaseEvent { row, rowIndex, rowData, selection }

// Column events
interface ColumnSortEvent extends BaseEvent { column, field, direction, previousSort }
interface ColumnResizeEvent extends BaseEvent { column, field, width, previousWidth }

// Search events
interface SearchEvent extends BaseEvent { searchTerm, matchCount, totalRows, previousTerm }
interface SearchHighlightEvent extends BaseEvent { searchTerm, highlightedCells }

// Configuration events
interface ConfigChangeEvent extends BaseEvent { changes, config, previousConfig }

// Copy/Export events
interface CopyEvent extends BaseEvent { format, rowCount, columnCount, dataSize, success }
interface ClipboardEvent extends BaseEvent { selection, format, dataSize, success }

// Lifecycle events
interface ReadyEvent extends BaseEvent { rowCount, columnCount, renderTime }
interface DestroyEvent extends BaseEvent { reason }

// Error events
interface ErrorEvent extends BaseEvent { error, context, recoverable }
```

---

## Next Steps

Phase 1 complete with all contracts defined:
1. ✅ **plugin-api.md** - Plugin interface
2. ✅ **config-schema.md** - Configuration schema
3. ✅ **events.md** (this file) - Event contracts

Next: Generate quickstart.md for integration guidance
