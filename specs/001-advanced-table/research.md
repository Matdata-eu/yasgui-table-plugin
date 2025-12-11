# Research: Advanced Interactive Table Plugin

**Date**: 2025-12-11  
**Feature**: Advanced Interactive Table Plugin  
**Purpose**: Technical research for implementation decisions

## Table Library Comparison

### Decision: Which JavaScript table library to use?

**Context**: The plugin requires high-performance virtual scrolling, column resizing, sorting, cell selection, and extensive customization. Three leading libraries were evaluated.

### Option A: Tabulator (RECOMMENDED ✅)

**Version**: 6.2+ (latest stable)  
**License**: MIT  
**Bundle Size**: ~45KB gzipped  
**GitHub Stars**: ~6,000+  
**Active Development**: Yes (regular updates)

**Pros**:
- ✅ **Virtual DOM scrolling** built-in - handles 100,000+ rows efficiently
- ✅ **Column resizing** with visual guides (standard drag handle behavior)
- ✅ **Advanced cell selection** - supports range selection, click/shift-click/drag patterns
- ✅ **Custom cell formatters** - easy to implement SPARQL-specific rendering (URIs, literals, blank nodes)
- ✅ **Keyboard navigation** - arrow keys, tab navigation built-in
- ✅ **Sorting** - multi-column with custom comparators
- ✅ **Row numbering** - built-in row numbering feature or via custom column
- ✅ **Theming** - CSS variables support, easy light/dark theme integration
- ✅ **Column fit modes** - built-in "fit to data" and "fit to columns" functionality
- ✅ **Clipboard integration** - built-in copy/paste with customizable formats
- ✅ **Persistence** - built-in persistence system for column state, sorting
- ✅ **Module system** - only include needed features (smaller bundle)
- ✅ **Excellent documentation** - comprehensive API docs and examples
- ✅ **TypeScript support** - type definitions available
- ✅ **Browser compatibility** - supports all target browsers

**Cons**:
- ⚠️ Bundle size slightly larger than AG Grid community edition
- ⚠️ Search/filter requires custom implementation (not built-in with highlighting)
- ⚠️ Learning curve for advanced customization

**Why Chosen**:
1. **Virtual scrolling performance** aligns perfectly with FR-004 and SC-001 (10,000+ rows in <2s)
2. **Cell formatters** allow clean SPARQL data type rendering without fighting the library
3. **Column resizing with guides** matches FR-016/FR-017 with standard behavior
4. **Clipboard support** simplifies FR-027/FR-028 implementation
5. **CSS theming** enables clean YASGUI theme integration per FR-033/FR-034
6. **MIT license** - no commercial restrictions for distribution
7. **Active maintenance** - regular security and feature updates
8. **Best balance** of features, performance, and customization flexibility

---

### Option B: AG Grid (Community Edition)

**Version**: 31.x  
**License**: MIT (Community), Commercial (Enterprise)  
**Bundle Size**: ~40KB gzipped (Community)  
**GitHub Stars**: ~12,000+  
**Active Development**: Yes (commercial backing)

**Pros**:
- ✅ **Industry-leading performance** - optimized for enterprise-scale data
- ✅ **Virtual scrolling** - excellent performance with millions of rows
- ✅ **Cell selection** - range selection built-in (Enterprise only)
- ✅ **Column resizing** - professional-grade resize with guides
- ✅ **Extensive API** - comprehensive feature set
- ✅ **TypeScript first** - excellent type safety
- ✅ **Commercial support** available

**Cons**:
- ❌ **Range selection requires Enterprise license** ($999+/developer) - violates constitution (distributable as standalone module)
- ❌ **Many features locked behind paywall** (clipboard, Excel export, advanced filtering)
- ❌ **Complex API** - steep learning curve, overkill for plugin needs
- ❌ **Bundle size grows** with features (Framework overhead)
- ❌ **Framework-oriented** - designed for React/Angular/Vue, vanilla JS is secondary
- ❌ **Theming complexity** - more difficult to integrate with YASGUI themes
- ❌ **Enterprise features needed** for search highlighting, advanced clipboard

**Why Rejected**:
- **License restrictions**: Cell range selection (FR-025, FR-026) requires Enterprise license, which conflicts with free/open plugin distribution
- **Complexity overhead**: Feature set far exceeds plugin needs, adding unnecessary bundle weight
- **Integration friction**: Framework-first design makes YASGUI integration more complex

---

### Option C: Handsontable

**Version**: 14.x  
**License**: Commercial (free for non-commercial)  
**Bundle Size**: ~100KB gzipped  
**GitHub Stars**: ~19,000+  
**Active Development**: Yes (commercial)

**Pros**:
- ✅ **Excel-like UX** - familiar spreadsheet interface
- ✅ **Cell selection** - professional range selection
- ✅ **Copy/paste** - Excel-compatible clipboard
- ✅ **Column resizing** - spreadsheet-style resize
- ✅ **Virtual scrolling** - good performance
- ✅ **Data validation** - built-in validators

**Cons**:
- ❌ **Commercial license required** ($990+/developer for commercial use) - violates free distribution
- ❌ **Large bundle size** (~100KB) - exceeds 80KB target (Technical Standards)
- ❌ **Spreadsheet-centric** - editing-focused, not optimized for read-only display
- ❌ **Overkill features** - cell editing, formulas, Excel import not needed
- ❌ **License ambiguity** - "non-commercial" definition unclear for OSS plugin
- ❌ **Performance optimization** focused on editing, not large read-only datasets
- ❌ **Theming** - custom theme system, harder YASGUI integration

**Why Rejected**:
- **License incompatible**: Commercial license required for most use cases, preventing free plugin distribution
- **Bundle size**: 100KB exceeds constitution's 80KB target
- **Wrong focus**: Editing features add weight without value for read-only SPARQL results
- **Performance**: Optimized for editing workflows, not read-only data inspection

---

## Comparison Summary

| Feature | Tabulator | AG Grid Community | Handsontable |
|---------|-----------|-------------------|--------------|
| **License** | MIT ✅ | MIT (limited) ⚠️ | Commercial ❌ |
| **Bundle Size** | 45KB ✅ | 40KB ✅ | 100KB ❌ |
| **Virtual Scrolling** | Yes ✅ | Yes ✅ | Yes ✅ |
| **Cell Selection** | Yes ✅ | Enterprise only ❌ | Yes (paid) ⚠️ |
| **Column Resize** | Yes ✅ | Yes ✅ | Yes ✅ |
| **Clipboard** | Yes ✅ | Enterprise only ❌ | Yes ✅ |
| **Custom Formatters** | Excellent ✅ | Good ✅ | Limited ⚠️ |
| **Theming** | CSS vars ✅ | Complex ⚠️ | Custom ⚠️ |
| **TypeScript** | Yes ✅ | Excellent ✅ | Yes ✅ |
| **Read-only Focus** | Yes ✅ | Yes ✅ | No ❌ |
| **Free Distribution** | Yes ✅ | Limited ⚠️ | No ❌ |
| **Learning Curve** | Moderate ✅ | Steep ⚠️ | Moderate ✅ |

**Winner**: **Tabulator** ✅

**Rationale**:
- Only option with MIT license + all required features in free version
- Bundle size within constitutional limits (45KB vs 80KB target)
- Custom formatters enable SPARQL-specific rendering without workarounds
- CSS theming aligns with YASGUI theme system (FR-033/FR-034)
- Virtual scrolling meets performance requirements (FR-004, SC-001)
- Active development with responsive maintainer
- Best fit for read-only data inspection use case

---

## Virtual Scrolling Strategy

**Decision**: Use Tabulator's built-in virtual DOM scrolling (renderVertical: "virtual")

**Clarification Reference**: Specification clarification session 2025-12-11 - Q4 confirmed virtual scrolling (windowing) approach

**Implementation Details**:
- Render visible rows + buffer (default: ~20 rows above/below viewport)
- Dynamic row rendering on scroll events
- Placeholder DOM elements for scroll bar sizing
- No full dataset DOM rendering (critical for 100,000+ row edge case)

**Performance Targets**:
- 10,000 rows: <2s initial render (SC-001)
- 100,000 rows: No UI freezing
- Scroll frame rate: 60fps

**Configuration**:
```javascript
{
  renderVertical: "virtual",
  virtualDomBuffer: 300, // Buffer height in pixels
  height: "100%"         // Fill YASR container (FR-006)
}
```

---

## SPARQL Data Type Handling

**Challenge**: SPARQL results contain diverse data types that require specific rendering.

### Data Type Mapping

| SPARQL Type | Binding Structure | Rendering Strategy |
|-------------|-------------------|-------------------|
| URI | `{ type: "uri", value: "http://..." }` | URI formatter with prefix abbreviation |
| Literal | `{ type: "literal", value: "text" }` | Plain text display |
| Typed Literal | `{ type: "literal", value: "42", datatype: "xsd:integer" }` | Value + optional datatype annotation |
| Language Literal | `{ type: "literal", value: "Hello", "xml:lang": "en" }` | Value + optional language tag |
| Blank Node | `{ type: "bnode", value: "_:b0" }` | Blank node formatter (italics, grey) |

### Formatter Architecture

**Decision**: Custom Tabulator cell formatters per data type

```javascript
// Example: URI formatter
function uriFormatter(cell, formatterParams, onRendered) {
  const binding = cell.getValue();
  const displayMode = getDisplayMode(); // from config
  
  if (binding.type === 'uri') {
    return displayMode === 'abbreviated' 
      ? abbreviateURI(binding.value, prefixes)
      : binding.value;
  }
  return binding.value;
}
```

**Advantages**:
- Type-safe rendering (prevents display errors)
- Toggle controls (FR-009, FR-010) simply re-render with new formatter params
- Formatters encapsulate display logic (testable)
- Supports ellipsis mode (FR-011) via formatter chaining

---

## Search and Highlighting

**Challenge**: Tabulator doesn't have built-in search highlighting

**Decision**: Custom search implementation with CSS-based highlighting

**Clarification Reference**: Specification clarification session 2025-12-11 - Q1 confirmed theme-responsive highlighting

**Implementation Approach**:
1. **Filtering**: Use Tabulator's filter API with custom filter function
2. **Highlighting**: Wrap matched text in `<mark>` elements with theme-responsive CSS class
3. **Performance**: Debounce search input (300ms) to prevent excessive re-renders

**Code Pattern**:
```javascript
function searchFilter(data, filterParams) {
  const searchTerm = filterParams.searchTerm.toLowerCase();
  return Object.values(data).some(cell => 
    String(cell.value).toLowerCase().includes(searchTerm)
  );
}

function highlightText(text, searchTerm) {
  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}
```

**CSS (theme-responsive)**:
```css
.search-highlight {
  background-color: var(--yasgui-search-highlight-bg);
  color: var(--yasgui-search-highlight-text);
}
```

---

## Ellipsized Cell Expansion

**Challenge**: Display full content of truncated cells

**Clarification Reference**: Specification clarification session 2025-12-11 - Q2 confirmed modal/tooltip overlay

**Decision**: Custom modal overlay triggered by click on ellipsized cells

**Implementation Strategy**:
1. **Ellipsis Mode**: CSS `text-overflow: ellipsis` + `overflow: hidden` on cells
2. **Click Handler**: Tabulator `cellClick` event
3. **Modal Display**: Lightweight modal overlay (no external library needed)
4. **Accessibility**: Modal supports Esc key to close, focus trap

**Component**:
```javascript
class CellExpansionModal {
  show(cellValue) {
    // Create overlay with full content
    // Position near clicked cell
    // Add close handlers (click outside, Esc key)
    // Return focus to cell on close
  }
}
```

**Rationale**: Preserves table layout (vs inline expansion), handles 10,000+ character content gracefully

---

## Clipboard and Export

**Challenge**: Multiple export formats (tab-separated, CSV, Markdown)

**Decision**: Leverage Tabulator's clipboard module + custom formatters

### Tab-Separated Copy (FR-027, FR-028)

**Implementation**: Tabulator's `clipboardCopyConfig`
```javascript
{
  clipboard: true,
  clipboardCopySelector: "table",
  clipboardCopyFormatter: "table", // tab-separated
  clipboardCopyStyled: false       // plain text only
}
```

**Ctrl+C Integration**: Tabulator handles keyboard shortcut automatically

### CSV Export (FR-030, FR-031)

**Implementation**: Tabulator's download module
```javascript
// Copy to clipboard
table.copyToClipboard("csv");

// Download file
table.download("csv", "sparql-results.csv", {
  delimiter: ",",
  bom: true // UTF-8 BOM for Excel compatibility
});
```

### Markdown Export (FR-029)

**Implementation**: Custom formatter
```javascript
function markdownFormatter(data) {
  const headers = columns.map(col => col.field).join(" | ");
  const separator = columns.map(() => "---").join(" | ");
  const rows = data.map(row => 
    columns.map(col => row[col.field].value || "").join(" | ")
  ).join("\n");
  
  return `${headers}\n${separator}\n${rows}`;
}
```

**Rationale**: Tabulator's built-in features cover most needs; Markdown requires custom implementation

---

## Theme Integration

**Challenge**: Integrate with YASGUI's light/dark theme system

**Decision**: CSS custom properties bridge between YASGUI and Tabulator

**Architecture**:
```css
/* YASGUI provides these variables */
:root {
  --yasgui-bg-primary: #ffffff;
  --yasgui-text-primary: #000000;
  /* ... other YASGUI theme vars ... */
}

/* Map to Tabulator classes */
.tabulator {
  background-color: var(--yasgui-bg-primary);
  color: var(--yasgui-text-primary);
  border-color: var(--yasgui-border-color);
}

.tabulator-row {
  background-color: var(--yasgui-bg-secondary);
}

.tabulator-row:hover {
  background-color: var(--yasgui-bg-hover);
}

.tabulator-selected {
  background-color: var(--yasgui-accent-color);
}
```

**Theme Switching**: No JavaScript needed; YASGUI updates CSS variables, Tabulator styles react automatically

**WCAG AA Compliance**: Verify contrast ratios in both themes (FR-035)

---

## Storage and Persistence

**Challenge**: Persist user preferences across sessions

**Decision**: localStorage with namespaced keys

**Stored State**:
- Column widths (FR-039)
- Sort state (column, direction) (FR-039)
- Display options (URI mode, datatype visibility, ellipsis) (FR-039)
- Last search query (optional)

**Implementation**:
```javascript
class PluginStorage {
  constructor(pluginId) {
    this.prefix = `yasgui-table-${pluginId}`;
  }
  
  save(key, value) {
    localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(value));
  }
  
  load(key, defaultValue) {
    const item = localStorage.getItem(`${this.prefix}:${key}`);
    return item ? JSON.parse(item) : defaultValue;
  }
}
```

**Persistence Events**: Save on column resize, sort change, option toggle

**Rationale**: Tabulator has persistence module but custom wrapper provides plugin isolation

---

## Performance Optimization

### Rendering Performance (SC-001)

**Target**: 10,000+ rows in <2 seconds

**Strategies**:
1. **Virtual scrolling**: Only render visible rows (Tabulator built-in)
2. **Lazy formatters**: Defer expensive formatting until scroll
3. **Memo columns**: Cache column definitions
4. **Batch updates**: Use Tabulator's `replaceData()` not row-by-row updates
5. **Minimal DOM**: Simple cell templates, avoid nested structures

### Search Performance (SC-009)

**Target**: <500ms for 10,000 rows

**Strategies**:
1. **Debounce input**: 300ms delay reduces filter calls
2. **Index search**: Pre-process data into searchable strings
3. **Progressive highlighting**: Highlight only visible rows
4. **Web Worker** (future): Off-thread filtering for 50,000+ rows

### Column Resize Performance (SC-008)

**Target**: <100ms resize feedback

**Strategies**:
1. **CSS-only guides**: No JavaScript calculations during drag
2. **Throttle resize events**: Update width every 16ms (60fps)
3. **Tabulator built-in**: Leverages optimized resize handlers

---

## Browser Compatibility

**Target Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)

### Feature Support Matrix

| Feature | Chrome | Firefox | Safari | Edge | Fallback |
|---------|--------|---------|--------|------|----------|
| CSS Variables | ✅ | ✅ | ✅ | ✅ | N/A (baseline) |
| Clipboard API | ✅ | ✅ | ✅ | ✅ | execCommand fallback |
| localStorage | ✅ | ✅ | ✅ | ✅ | No persistence |
| Flexbox | ✅ | ✅ | ✅ | ✅ | N/A (baseline) |
| Virtual Scrolling | ✅ | ✅ | ✅ | ✅ | N/A (Tabulator) |

### Clipboard API Fallback

```javascript
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
```

---

## Unknowns Resolved

✅ All "NEEDS CLARIFICATION" items from Technical Context have been addressed:

1. **Language/Version**: JavaScript ES2018, TypeScript 5.x
2. **Primary Dependencies**: Tabulator 6.x selected via comparison
3. **Testing**: Jest for unit, Playwright for integration (optional)
4. **Target Platform**: Modern browsers (4 major, 2 versions each)
5. **Performance Goals**: Specific targets defined (10k rows, <2s, etc.)
6. **Constraints**: Bundle <80KB, WCAG AA, no core mods, etc.

✅ All specification clarifications (from 2025-12-11 session) incorporated:

1. **Search highlighting**: Theme-responsive via CSS variables
2. **Ellipsis expansion**: Modal overlay preserving layout
3. **Resize guides**: Standard library behavior (Tabulator)
4. **Virtual scrolling**: Windowing technique confirmed
5. **Row number scroll**: Standard library column behavior

---

## Next Phase Dependencies

Phase 1 (Design) can now proceed with:
- **data-model.md**: SPARQL binding structures, plugin state model
- **contracts/**: Plugin API interface, configuration schema
- **quickstart.md**: Integration guide with YASGUI

All technical unknowns resolved. No blockers for design phase.
