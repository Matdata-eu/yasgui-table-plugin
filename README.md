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
- 🧠 **Smart Formatters** - Auto-format cells by XSD datatype (e.g. `xsd:boolean` → check / cross icon) and variable name suffix conventions (e.g. `*stars`, `*percent`, `*image`, `*color`, `*description`)
- **Decimal Places** - Configure a fixed number of fraction digits for `xsd:float`, `xsd:double`, and `xsd:decimal` literals via the Display dropdown (View settings in newer MatGUI) or `displayConfig.decimalPlaces` (leave unset for raw values)
- 🧭 **Explore a Resource** - Ctrl+click (Cmd+click on macOS) any URI to see all triples where it is the **subject**; Ctrl+Shift+click to see all triples where it is the **object**. In newer MatGUI versions the resource opens in the shared describe panel, the same one the other result views use; with older versions the query runs in the background with the prefixes declared in your main query and the result opens in the plugin's own modal (see [Compatibility](#compatibility-with-old-and-new-matgui)). Right-click a URI for the same options, or to run them as a new main query that replaces the current results. URIs inside the panel or modal can be Ctrl+clicked too, to hop from node to node; its back / forward buttons (or Alt+← / Alt+→) step back and forward through those hops and the modal's back-to-start button returns to the original resource
- 🔗 **URI Link Prefix** - Toolbar control to set a custom URL prefix for all URI links (e.g. point to a faceted browser); overrides `uriHrefAdapter` when set by the user
- ❓ **Quick Reference** - Toolbar help icon opens an in-place quick reference card listing all features and keyboard shortcuts

## Installation

### npm

```bash
npm install @matdata/yasgui-table-plugin
```

### CDN

```html
<script src="https://unpkg.com/@matdata/yasgui-table-plugin/dist/yasgui-table-plugin.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@matdata/yasgui-table-plugin/dist/yasgui-table-plugin.css">
```

## Quick Start

```javascript
import Yasgui from '@yasgui/yasgui';
import TablePlugin from '@matdata/yasgui-table-plugin';
import '@yasgui/yasgui/build/yasgui.min.css';
import '@matdata/yasgui-table-plugin/dist/yasgui-table-plugin.css';

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
          ellipsisMode: true,             // Truncate long cell content (default: on)
          smartFormatters: true,          // Apply suffix-based formatters (default: on)
          decimalPlaces: 2                // Fixed fraction digits for xsd:float/double/decimal (omit for raw values)
        },
        persistenceEnabled: true,         // Save user preferences

        // Developer adapter: transform a URI into a custom href (overridden by user-set uriLinkPrefix)
        uriHrefAdapter: (uri) => `https://browser.example.org/?uri=${encodeURIComponent(uri)}`,

        // Developer adapter: transform an entire binding set before rendering
        bindingSetAdapter: (bindingSet) => bindingSet,
      }
    }
  }
});
```

## Compatibility with old and new MatGUI

The plugin works with both today's published `@matdata/yasgui` and newer MatGUI
versions that offer a *host API* on yasr. It detects the host API by feature,
never by version number, and falls back to its own UI when a feature is missing:

| Feature | Newer MatGUI (`yasr.hostApi`) | Older MatGUI / plain yasr |
|---|---|---|
| Explore a resource (Ctrl+click, Ctrl+Shift+click, context menu) | `yasr.describe(iri, { direction: 'outgoing' \| 'incoming', source: 'Table' })` opens the shared describe panel | the plugin runs the query with `yasr.executeQuery()` and shows its own modal |
| Toolbar | the controls are rendered into the yasr plugin toolbar slot (`yasr.getPluginToolbar()`) with the shared `.yasr_toolbar*` classes; display options sit at the far right as **View settings** | the plugin draws its own toolbar above the table |

Detection, in short:

```js
const host = yasr.hostApi;
const useDescribePanel = !!host?.describe && typeof yasr.describe === 'function';
const toolbarSlot = host?.toolbar && typeof yasr.getPluginToolbar === 'function' ? yasr.getPluginToolbar() : null;
```

All configuration options, events, persisted settings and CSS variables are the
same on both paths. The plugin's own describe modal (`DescribeModal`) and its
DESCRIBE response parser are deprecated: they are kept as the fallback for older
yasr versions and will be removed in the next major version.

In the toolbar slot the plugin uses these shared classes, styled by MatGUI:
`.yasr_toolbarButton` (Fit, Copy, link prefix, help, View settings; `aria-pressed`
on the link prefix button while a custom prefix is set), `.yasr_toolbarSearch`
(the search input) inside a `.yasr_toolbarGroup`, and `.yasr_toolbarSpacer`.
The plugin's own elements there carry `.table-host-toolbar-item`.

Icons are inline [Lucide](https://lucide.dev) stroke SVGs drawn in `currentColor`.
Plugin CSS uses `var(--yasgui-*, fallback)` throughout, including the newer
MatGUI tokens such as `--yasgui-brand` and `--yasgui-surface-raised`, so it looks
right with and without them.

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

// Listen for URI link prefix changes
tablePlugin.on('linkPrefixChange', (data) => {
  console.log(`Link prefix set to: ${data.prefix}`);
});

// Listen for resource triple queries (Ctrl+click / Ctrl+Shift+click)
// With the shared describe panel (newer MatGUI) the event has panel: 'host'
// and no triple count, because yasr runs the query.
tablePlugin.on('describeQuery', (data) => {
  if (data.panel === 'host') {
    console.log(`${data.uri} (${data.direction}) opened in the describe panel: ${data.success}`);
  } else {
    console.log(`${data.uri} (${data.direction}): ${data.success ? data.triples + ' triples' : 'failed'}`);
  }
});

// Available events:
// - ready, search, columnSort, columnResize, cellDoubleClick
// - selectionChange, selectionCleared, clipboardCopy
// - copy, layoutChange, linkPrefixChange, describeQuery, error, destroy
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

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
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
- CJS, ESM, and minified UMD module formats
- PostCSS for CSS processing
- TypeScript type declarations

Build outputs are generated in `dist/` with `.cjs.js`, `.esm.js`, and `.min.js` formats.

## License

Apache-2.0

## Contributing

Contributions are welcome! Please read the specification documents in `./specs/001-advanced-table/` before submitting changes.
