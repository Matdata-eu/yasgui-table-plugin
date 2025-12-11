# Data Model: Advanced Interactive Table Plugin

**Feature**: Advanced Interactive Table Plugin  
**Date**: 2025-12-11  
**Source**: Derived from [spec.md](spec.md) requirements and [research.md](research.md) decisions

## Overview

This document defines the data structures and state management for the YASGUI table plugin. The plugin transforms SPARQL SELECT results into an interactive table using Tabulator, maintaining state for user preferences and rendering configuration.

---

## Core Entities

### 1. SPARQL Result Binding

Represents a single variable binding from SPARQL query results.

**Structure** (from YASGUI/YASR standard format):
```typescript
interface SparqlBinding {
  type: 'uri' | 'literal' | 'bnode';
  value: string;
  datatype?: string;      // e.g., "http://www.w3.org/2001/XMLSchema#integer"
  'xml:lang'?: string;    // e.g., "en", "fr"
}
```

**Examples**:
```javascript
// URI
{
  type: "uri",
  value: "http://dbpedia.org/resource/Paris"
}

// Typed Literal
{
  type: "literal",
  value: "42",
  datatype: "http://www.w3.org/2001/XMLSchema#integer"
}

// Language-tagged Literal
{
  type: "literal",
  value: "Hello",
  "xml:lang": "en"
}

// Blank Node
{
  type: "bnode",
  value: "_:b0"
}
```

**Relationships**:
- Contained in: `ResultRow` (one binding per SPARQL variable)
- Used by: Cell formatters for rendering

**Validation Rules**:
- `type` must be one of: 'uri', 'literal', 'bnode'
- `value` is required (never null/undefined)
- `datatype` only valid when `type` is 'literal'
- `xml:lang` only valid when `type` is 'literal'

---

### 2. SPARQL Query Results

Represents the complete result set from a SPARQL SELECT query.

**Structure** (YASR standard):
```typescript
interface SparqlResults {
  head: {
    vars: string[];        // SPARQL variable names (without '?')
  };
  results: {
    bindings: ResultRow[]; // Array of result rows
  };
}

interface ResultRow {
  [varName: string]: SparqlBinding | undefined;
}
```

**Example**:
```javascript
{
  head: {
    vars: ["person", "name", "age"]
  },
  results: {
    bindings: [
      {
        person: { type: "uri", value: "http://example.org/person/1" },
        name: { type: "literal", value: "Alice" },
        age: { type: "literal", value: "30", datatype: "xsd:integer" }
      },
      {
        person: { type: "uri", value: "http://example.org/person/2" },
        name: { type: "literal", value: "Bob" },
        age: { type: "literal", value: "25", datatype: "xsd:integer" }
      }
    ]
  }
}
```

**Relationships**:
- Input to: Plugin `draw()` method
- Transformed to: `TableRow[]` for Tabulator

**Validation**:
- `head.vars` array must not be empty (handled by YASR)
- `results.bindings` may be empty (edge case: no results)
- Variable names in bindings must match `head.vars`

---

### 3. Table Column

Represents a column in the rendered table.

**Structure**:
```typescript
interface TableColumn {
  field: string;           // SPARQL variable name
  title: string;           // Display name (same as field by default)
  width?: number;          // Column width in pixels (user-adjustable)
  sorter?: string;         // Sort type: 'string', 'number', 'alphanum'
  formatter: Function;     // Cell formatter function
  headerSort: boolean;     // Enable/disable sorting (default: true)
  resizable: boolean;      // Enable column resizing (default: true)
  frozen?: boolean;        // Sticky column (for row numbers)
}
```

**Special Column**: Row Numbers
```typescript
{
  field: "_rowNum",        // Internal field (not from SPARQL)
  title: "#",
  width: 60,
  frozen: true,            // Remains visible during horizontal scroll
  headerSort: false,       // Row numbers not sortable
  resizable: false,        // Fixed width
  formatter: (cell) => cell.getRow().getPosition()
}
```

**Relationships**:
- Generated from: `SparqlResults.head.vars`
- Used by: Tabulator table configuration
- Persisted in: `DisplayConfiguration.columnWidths`

**State Transitions**:
- Column created → Default width (auto)
- User resizes → Width stored in `columnWidths`
- User sorts → Sort state updated in `DisplayConfiguration`

---

### 4. Table Row

Represents a single row of data in the table (Tabulator format).

**Structure**:
```typescript
interface TableRow {
  _id: string;                 // Unique row identifier
  _rowNum: number;             // Row number (1-indexed)
  _selected: boolean;          // Selection state
  [varName: string]: any;      // SPARQL bindings (column values)
}
```

**Example** (from SPARQL binding):
```javascript
{
  _id: "row-1",
  _rowNum: 1,
  _selected: false,
  person: { type: "uri", value: "http://example.org/person/1" },
  name: { type: "literal", value: "Alice" },
  age: { type: "literal", value: "30", datatype: "xsd:integer" }
}
```

**Relationships**:
- Transformed from: `ResultRow` (SPARQL binding)
- Contains: `SparqlBinding` objects as column values
- Managed by: Tabulator table instance

**State**:
- `_selected`: Updated by cell selection logic (FR-024, FR-025, FR-026)
- Row data immutable (read-only table per FR-007)

---

### 5. Display Configuration

Represents user preferences for table display and behavior.

**Structure**:
```typescript
interface DisplayConfiguration {
  // URI Display (FR-009)
  uriDisplayMode: 'full' | 'abbreviated';
  
  // Datatype Display (FR-010)
  showDatatypes: boolean;
  
  // Ellipsis Mode (FR-011)
  ellipsisMode: boolean;
  
  // Column State (FR-039)
  columnWidths: {
    [columnField: string]: number;  // Pixels
  };
  
  // Sort State (FR-039)
  sortState: {
    column: string | null;
    direction: 'asc' | 'desc' | null;
  };
  
  // Search State (optional persistence)
  lastSearch?: string;
}
```

**Default Values**:
```javascript
{
  uriDisplayMode: 'abbreviated',  // Default: show prefixed URIs
  showDatatypes: false,           // Default: hide datatype annotations
  ellipsisMode: false,            // Default: show full content
  columnWidths: {},               // Default: auto-sized columns
  sortState: {
    column: null,
    direction: null
  },
  lastSearch: ''
}
```

**Persistence**:
- Stored in: localStorage (key: `yasgui-table-{pluginId}:display-config`)
- Updated on: User toggle, column resize, sort change
- Loaded on: Plugin initialization

**Relationships**:
- Used by: Cell formatters (uriDisplayMode, showDatatypes)
- Used by: Table initialization (columnWidths, sortState)
- Updated by: Control components

---

### 6. Selection Range

Represents the current cell selection state.

**Structure**:
```typescript
interface SelectionRange {
  start: CellPosition;
  end: CellPosition;
  cells: SelectedCell[];
}

interface CellPosition {
  row: number;      // Row index (0-based)
  column: string;   // Column field name
}

interface SelectedCell {
  position: CellPosition;
  value: SparqlBinding;
}
```

**Selection Types**:

**Single Cell**:
```javascript
{
  start: { row: 0, column: "name" },
  end: { row: 0, column: "name" },
  cells: [
    { 
      position: { row: 0, column: "name" },
      value: { type: "literal", value: "Alice" }
    }
  ]
}
```

**Range Selection** (Shift+Click, FR-025):
```javascript
{
  start: { row: 0, column: "name" },
  end: { row: 2, column: "age" },
  cells: [
    // All cells in rectangular region
  ]
}
```

**Row Selection** (Click row number, FR-026):
```javascript
{
  start: { row: 1, column: "*" },  // Special: all columns
  end: { row: 1, column: "*" },
  cells: [
    // All cells in row 1
  ]
}
```

**Relationships**:
- Updated by: Cell click handlers, keyboard navigation
- Used by: Clipboard copy operation (FR-027, FR-028)
- Cleared on: Click outside table, new query results

**State Transitions**:
- No selection → Click cell → Single cell selected
- Single cell → Shift+Click → Range selected
- Any selection → Click row number → Row selected
- Any selection → Ctrl+C → Copy to clipboard
- Any selection → Click elsewhere → Selection cleared

---

## Derived Data

### 7. Prefix Map

Maps URI namespaces to prefixes for abbreviation.

**Structure**:
```typescript
interface PrefixMap {
  [prefix: string]: string;  // prefix → namespace URI
}
```

**Example**:
```javascript
{
  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
  "foaf": "http://xmlns.com/foaf/0.1/",
  "dbr": "http://dbpedia.org/resource/",
  "dbo": "http://dbpedia.org/ontology/"
}
```

**Source**: 
- YASQE prefix definitions (via `yasqe.getPrefixes()`)
- Passed to plugin via configuration

**Usage**:
- URI abbreviation: `http://xmlns.com/foaf/0.1/Person` → `foaf:Person`
- Reverse lookup: `foaf:Person` → `http://xmlns.com/foaf/0.1/Person`

---

### 8. Filter State

Represents active search/filter criteria.

**Structure**:
```typescript
interface FilterState {
  searchTerm: string;
  matchCount: number;
  totalRows: number;
}
```

**Example**:
```javascript
{
  searchTerm: "alice",
  matchCount: 3,         // Rows containing "alice"
  totalRows: 100        // Total rows in dataset
}
```

**Relationships**:
- Updated by: Search input component
- Applied to: Tabulator filter function
- Displayed in: Row count indicator (FR-023)

---

## Data Flow

### Plugin Initialization

```
YASR Results (JSON)
  ↓
Plugin.canHandleResults() → Check for SELECT results (FR-037)
  ↓
Plugin.draw(results)
  ↓
Parse SPARQL bindings → TableRow[]
  ↓
Load DisplayConfiguration from localStorage
  ↓
Generate TableColumn[] from results.head.vars
  ↓
Initialize Tabulator(columns, rows, config)
  ↓
Render table in YASR container
```

### User Interaction: Search

```
User types in search input
  ↓
Debounce 300ms
  ↓
Update FilterState.searchTerm
  ↓
Apply Tabulator filter function
  ↓
Filter rows (case-insensitive match across all columns)
  ↓
Highlight matched terms in visible cells
  ↓
Update row count display (FR-023)
```

### User Interaction: Toggle URI Display

```
User clicks "URI Display" toggle
  ↓
Update DisplayConfiguration.uriDisplayMode
  ↓
Save to localStorage
  ↓
Re-render table with new formatter params
  ↓
URIs display in new format (full/abbreviated)
```

### User Interaction: Copy Selection

```
User selects cells (click, shift+click, drag)
  ↓
Update SelectionRange state
  ↓
User presses Ctrl+C
  ↓
Extract values from SelectionRange.cells
  ↓
Format as tab-separated text (FR-028)
  ↓
Write to clipboard via Clipboard API
```

---

## State Management

### Plugin State Container

```typescript
class PluginState {
  // Core data
  sparqlResults: SparqlResults;
  tableData: TableRow[];
  
  // Configuration
  displayConfig: DisplayConfiguration;
  prefixMap: PrefixMap;
  
  // UI State
  selectionRange: SelectionRange | null;
  filterState: FilterState;
  
  // Tabulator instance
  table: Tabulator;
  
  // Methods
  loadFromStorage(): void;
  saveToStorage(): void;
  updateDisplayConfig(updates: Partial<DisplayConfiguration>): void;
  clearSelection(): void;
  applyFilter(searchTerm: string): void;
}
```

### State Persistence

**localStorage Keys**:
- `yasgui-table-{pluginId}:display-config` → DisplayConfiguration
- `yasgui-table-{pluginId}:column-order` → string[] (optional)

**Session State** (not persisted):
- SelectionRange
- FilterState
- tableData (regenerated from SPARQL results each query)

---

## Validation Rules

### Input Validation

**SPARQL Results**:
- Must have `head.vars` array (not empty for SELECT results)
- Bindings must reference only variables in `head.vars`
- Binding types must be 'uri', 'literal', or 'bnode'

**DisplayConfiguration**:
- `uriDisplayMode` must be 'full' or 'abbreviated'
- `showDatatypes` must be boolean
- `ellipsisMode` must be boolean
- `columnWidths` values must be positive numbers
- `sortState.direction` must be 'asc', 'desc', or null

**SelectionRange**:
- `start.row` and `end.row` must be valid row indices
- `start.column` and `end.column` must be valid column fields

### Error Handling

**Empty Results** (Edge case from spec):
```javascript
if (results.results.bindings.length === 0) {
  // Display empty state message
  return '<div class="no-results">No results</div>';
}
```

**Invalid Binding Type**:
```javascript
if (!['uri', 'literal', 'bnode'].includes(binding.type)) {
  console.warn('Unknown binding type:', binding.type);
  return binding.value; // Fallback: display raw value
}
```

**Missing Prefix** (Edge case: URI can't be abbreviated):
```javascript
function abbreviateURI(uri, prefixMap) {
  for (const [prefix, namespace] of Object.entries(prefixMap)) {
    if (uri.startsWith(namespace)) {
      return `${prefix}:${uri.slice(namespace.length)}`;
    }
  }
  return uri; // Fallback: return full URI
}
```

---

## Performance Considerations

### Virtual Scrolling Impact on Data Model

- **Full dataset in memory**: All `TableRow[]` loaded initially
- **Rendered subset**: Only ~40 rows in DOM at any time (FR-004)
- **Scroll performance**: Tabulator manages rendering, plugin provides data

**Memory Estimate** (10,000 rows):
- TableRow object: ~500 bytes each
- 10,000 rows × 500 bytes = 5MB
- Acceptable for browser memory limits

**100,000+ rows** (Edge case):
- 100,000 × 500 bytes = 50MB
- Still manageable, but may require pagination for 1M+ rows (future enhancement)

### Search Performance

- **Linear scan**: O(n × m) where n=rows, m=columns
- **10,000 rows, 5 columns**: ~50,000 string comparisons
- **Optimization**: Debounce input (300ms), index pre-processing (future)

---

## Type Definitions Summary

```typescript
// Core SPARQL types
interface SparqlBinding { type, value, datatype?, 'xml:lang'? }
interface ResultRow { [varName: string]: SparqlBinding }
interface SparqlResults { head: { vars }, results: { bindings } }

// Table representation
interface TableColumn { field, title, width?, sorter, formatter, headerSort, resizable, frozen? }
interface TableRow { _id, _rowNum, _selected, [varName: string]: any }

// Configuration & State
interface DisplayConfiguration { uriDisplayMode, showDatatypes, ellipsisMode, columnWidths, sortState, lastSearch? }
interface SelectionRange { start, end, cells }
interface FilterState { searchTerm, matchCount, totalRows }

// Derived data
interface PrefixMap { [prefix: string]: string }
```

---

## Next Steps

With data model defined, Phase 1 continues with:
1. ✅ **data-model.md** (this file) - Complete
2. ⏳ **contracts/** - Plugin API interfaces
3. ⏳ **quickstart.md** - Integration guide

All data structures defined with validation rules, relationships, and state transitions documented.
