# YASGUI Table Plugin

High-performance YASGUI plugin for rendering SPARQL SELECT results in an interactive table with advanced features.

## Features

- 🚀 **Virtual Scrolling** - Efficiently handles 10,000+ rows
- 🔍 **Search & Filter** - Real-time search with highlighting
- 📊 **Interactive Columns** - Sort and resize columns
- 🎨 **Theme Support** - Integrates with YASGUI themes
- 📋 **Selection & Copy** - Select cells/rows and copy to clipboard
- 💾 **Export** - Export to Markdown, CSV, or TSV formats
- ♿ **Accessible** - WCAG AA compliant with keyboard navigation
- 🎯 **SPARQL-Aware** - Proper rendering of URIs, literals, datatypes, and blank nodes

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

# Development mode (watch)
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint
npm run lint

# Format code
npm run format
```

## License

MIT

## Contributing

Contributions are welcome! Please read the specification documents in `./specs/001-advanced-table/` before submitting changes.
