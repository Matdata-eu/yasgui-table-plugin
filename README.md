# YASGUI Table Plugin

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://img.shields.io/npm/v/@matdata/yasgui-table-plugin.svg)](https://www.npmjs.com/package/@matdata/yasgui-table-plugin)

High-performance YASGUI plugin for rendering SPARQL SELECT results in an interactive table with advanced features.

## Features

- 🚀 **Virtual Scrolling** - Efficiently handles 10,000+ rows
- 🔍 **Search & Filter** - Real-time search with highlighting
- 📊 **Interactive Columns** - Sort and resize columns
- 🎨 **Dynamic Theme Support** - Automatically adapts to YASGUI light/dark theme changes
- 📋 **Selection & Copy** - Select cells/rows and copy to clipboard
- 💾 **Copy** - Copy to clipboard as Markdown, CSV, or TSV (tab-delimited) formats
- 📥 **YASR Integration** - Integrated with YASR's download interface for CSV export
- 💬 **Tooltips** - Hover over any cell to view full content
- 🔔 **Notifications** - Visual feedback for copy operations
- ♿ **Accessible** - WCAG AA compliant with keyboard navigation
- 🎯 **SPARQL-Aware** - Proper rendering of URIs, literals, datatypes, and blank nodes with prefix support from YASR

## Installation

### npm

```bash
npm install @matdata/yasgui-table-plugin
```

### CDN

```html
<script src="https://unpkg.com/@matdata/yasgui-table-plugin/dist/table-plugin.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@matdata/yasgui-table-plugin/dist/table-plugin.css">
```

## Quick Start

```javascript
import Yasgui from '@yasgui/yasgui';
import TablePlugin from '@matdata/yasgui-table-plugin';
import '@yasgui/yasgui/build/yasgui.min.css';
import '@matdata/yasgui-table-plugin/dist/table-plugin.css';

// Register the plugin
Yasgui.Yasr.plugins.table = TablePlugin;

// Create YASGUI instance
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  requestConfig: { endpoint: 'https://dbpedia.org/sparql' },
  yasqe: { value: 'SELECT * WHERE { ?s ?p ?o } LIMIT 100' }
});
```

## Configuration

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  yasr: {
    pluginsOptions: {
      table: {
        displayConfig: {
          uriDisplayMode: 'abbreviated',  // 'full' or 'abbreviated'
          showDatatypes: true,            // Show datatype annotations
          ellipsisMode: true              // Truncate long cell content
        },
        persistenceEnabled: true          // Save user preferences
      }
    }
  }
});
```

## Event API

The plugin emits events that can be used to integrate with your application:

```javascript
const tablePlugin = yasgui.getTab().yasr.plugins.table;

// Listen for search events
tablePlugin.on('search', (data) => {
  console.log(`Filtered to ${data.filteredCount} of ${data.totalCount} rows`);
});

// Listen for column sort
tablePlugin.on('columnSort', (data) => {
  console.log(`Sorted by ${data.column} ${data.dir}`);
});

// Listen for selection changes
tablePlugin.on('selectionChange', (data) => {
  console.log('Selection:', data.range);
});

// Listen for copy events
tablePlugin.on('copy', (data) => {
  console.log(`Copied as ${data.format}`);
});

// Available events:
// - ready, search, columnSort, columnResize, cellDoubleClick
// - selectionChange, selectionCleared, clipboardCopy
// - copy, layoutChange, error, destroy
```

## Public Methods

```javascript
// Get current selection
const selection = tablePlugin.getSelection();

// Clear selection
tablePlugin.clearSelection();

// Get download info
const downloadInfo = tablePlugin.getDownloadInfo();

// Update configuration
tablePlugin.updateConfig({ displayConfig: { ellipsisMode: true } });

// Event listeners
tablePlugin.on('eventName', handler);
tablePlugin.off('eventName', handler);
tablePlugin.once('eventName', handler);
```

## Browser Compatibility

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Documentation

For detailed documentation, see the [specification](./specs/001-advanced-table/spec.md) and [quickstart guide](./specs/001-advanced-table/quickstart.md).

## Development

```bash
# Install dependencies
npm install

# Start development server with Vite (http://localhost:3000)
npm run dev

# Build for production with esbuild
npm run build

# Run tests
npm run test

# Lint
npm run lint

# Format code
npm run format
```

### Development Server

The `npm run dev` command starts a Vite development server at `http://localhost:3000` with:
- Hot module replacement (HMR) for instant updates
- Source maps for debugging TypeScript
- Serves the demo page from `demo/index.html`
- Plugin source loaded directly from `src/` (no build needed)

The demo automatically loads the plugin from source during development for live reload.

### Build System

The project uses **esbuild** for production builds with:
- UMD and ESM module formats
- PostCSS for CSS processing
- TypeScript type declarations
- Watch mode for development (`npm run dev:build`)

Build outputs are generated in `dist/` with both `.umd.js` and `.esm.js` formats.

## License

MIT

## Contributing

Contributions are welcome! Please read the specification documents in `./specs/001-advanced-table/` before submitting changes.
