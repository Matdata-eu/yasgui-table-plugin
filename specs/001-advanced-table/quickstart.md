# Quickstart Guide: YASGUI Table Plugin

**Feature**: Advanced Interactive Table Plugin  
**Date**: 2025-12-11  
**Audience**: Developers integrating the plugin with YASGUI

## Overview

This guide demonstrates how to integrate the advanced table plugin with YASGUI to render SPARQL SELECT results as an interactive table with search, sort, resize, and export capabilities.

---

## Prerequisites

- **YASGUI**: Version 4.x or higher
- **Browser**: Chrome, Firefox, Safari, or Edge (latest 2 versions)
- **Build Tool**: esbuild (used internally), or any module bundler with ES6 support
- **Node.js**: 16+ (for development)

---

## Installation

### NPM Package (Recommended)

```bash
npm install @yasgui/table-plugin
```

### CDN (Browser)

```html
<script src="https://unpkg.com/@matdata/yasgui-table-plugin/dist/table-plugin.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@matdata/yasgui-table-plugin/dist/table-plugin.min.css">
```

---

## Basic Usage

### Minimal Setup

```javascript
import Yasgui from '@yasgui/yasgui';
import TablePlugin from '@yasgui/table-plugin';
import '@yasgui/yasgui/build/yasgui.min.css';
import '@yasgui/table-plugin/dist/table-plugin.min.css';

// Register plugin with YASGUI
Yasgui.Yasr.plugins.table = TablePlugin;

// Initialize YASGUI
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  yasqe: {
    value: `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?person ?name ?age
WHERE {
  ?person foaf:name ?name ;
          foaf:age ?age .
}
LIMIT 100`
  },
  yasr: {
    // Set table as default plugin
    defaultPlugin: 'table'
  }
});
```

**Result**: YASGUI renders with table plugin as default for SELECT queries.

---

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YASGUI with Table Plugin</title>
  
  <!-- YASGUI styles -->
  <link rel="stylesheet" href="https://unpkg.com/@yasgui/yasgui/build/yasgui.min.css">
  
  <!-- Table plugin styles -->
  <link rel="stylesheet" href="https://unpkg.com/@matdata/yasgui-table-plugin/dist/table-plugin.min.css">
  
  <style>
    #yasgui {
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="yasgui"></div>
  
  <script type="module">
    import Yasgui from 'https://unpkg.com/@yasgui/yasgui/build/yasgui.esm.js';
    import TablePlugin from 'https://unpkg.com/@matdata/yasgui-table-plugin/dist/table-plugin.esm.js';
    
    Yasgui.Yasr.plugins.table = TablePlugin;
    
    const yasgui = new Yasgui(document.getElementById('yasgui'), {
      yasr: { defaultPlugin: 'table' }
    });
  </script>
</body>
</html>
```

---

## Configuration Examples

### Custom Display Options

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  yasr: {
    defaultPlugin: 'table',
    pluginConfig: {
      table: {
        displayConfig: {
          uriDisplayMode: 'abbreviated',  // Show prefixed URIs
          showDatatypes: false,           // Hide datatype annotations
          ellipsisMode: true              // Truncate long content
        }
      }
    }
  }
});
```

**Effect**:
- URIs display as `foaf:Person` instead of `http://xmlns.com/foaf/0.1/Person`
- Literals show `42` instead of `42 (xsd:integer)`
- Long strings truncate with "…" (click to expand)

---

### Custom Theme Integration

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  yasr: {
    defaultPlugin: 'table',
    pluginConfig: {
      table: {
        themeIntegration: true,  // Use YASGUI theme colors
        tabulatorOptions: {
          layout: 'fitColumns',  // Fit columns to container width
          height: '600px'        // Fixed height
        }
      }
    }
  }
});
```

**Effect**: Table colors match YASGUI light/dark theme automatically.

---

### Performance-Optimized Configuration

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  yasr: {
    defaultPlugin: 'table',
    pluginConfig: {
      table: {
        tabulatorOptions: {
          renderVertical: 'virtual',     // Enable virtual scrolling
          virtualDomBuffer: 500,         // Larger render buffer
          placeholder: 'Loading...'      // Show during render
        }
      }
    }
  }
});
```

**Effect**: Smooth scrolling for 10,000+ row datasets.

---

### Custom Export Format

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  yasr: {
    defaultPlugin: 'table',
    pluginConfig: {
      table: {
        exportFormat: 'csv',  // Default to CSV instead of TSV
        displayConfig: {
          uriDisplayMode: 'full'  // Export full URIs
        }
      }
    }
  }
});
```

**Effect**: Download button generates CSV files with full URIs.

---

## Programmatic Access

### Accessing Plugin Instance

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'));

// Get active YASR instance
const yasr = yasgui.getTab().yasr;

// Get table plugin instance (after query execution)
yasr.on('drawn', () => {
  const tablePlugin = yasr.plugins['table'];
  
  if (tablePlugin && yasr.activePlugin === 'table') {
    console.log('Table plugin active');
    console.log('Current config:', tablePlugin.getConfig());
  }
});
```

---

### Updating Configuration at Runtime

```javascript
const yasr = yasgui.getTab().yasr;

yasr.on('drawn', () => {
  const tablePlugin = yasr.plugins['table'];
  
  // Toggle URI display mode
  document.getElementById('toggleURI').addEventListener('click', () => {
    const currentMode = tablePlugin.getConfig().displayConfig.uriDisplayMode;
    const newMode = currentMode === 'full' ? 'abbreviated' : 'full';
    
    tablePlugin.updateConfig({
      displayConfig: { uriDisplayMode: newMode }
    });
  });
});
```

---

### Listening to Plugin Events

```javascript
yasr.on('drawn', () => {
  const tablePlugin = yasr.plugins['table'];
  
  // Log search activity
  tablePlugin.on('search', (e) => {
    console.log(`Search: "${e.searchTerm}" - ${e.matchCount} matches`);
  });
  
  // Track cell clicks
  tablePlugin.on('cellClick', (e) => {
    console.log('Clicked:', e.value);
  });
  
  // Monitor copy operations
  tablePlugin.on('copy', (e) => {
    if (e.success) {
      console.log(`Copied ${e.rowCount} rows as ${e.format}`);
    }
  });
});
```

---

## Common Use Cases

### Use Case 1: DBpedia Explorer

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  yasqe: {
    value: `PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?city ?name ?population ?country
WHERE {
  ?city a dbo:City ;
        foaf:name ?name ;
        dbo:populationTotal ?population ;
        dbo:country ?country .
  FILTER(?population > 1000000)
}
ORDER BY DESC(?population)
LIMIT 100`
  },
  yasr: {
    defaultPlugin: 'table',
    pluginConfig: {
      table: {
        displayConfig: {
          uriDisplayMode: 'abbreviated',
          showDatatypes: false,
          ellipsisMode: false
        },
        prefixMap: {
          dbr: 'http://dbpedia.org/resource/',
          dbo: 'http://dbpedia.org/ontology/',
          foaf: 'http://xmlns.com/foaf/0.1/'
        }
      }
    }
  }
});
```

**Features Enabled**:
- Abbreviated URIs (dbr:London instead of http://dbpedia.org/resource/London)
- Sortable columns (click "population" to sort)
- Searchable (search for "London")
- Copy to clipboard as Markdown, CSV, or TSV (tab-delimited)
- Tooltips showing full cell content on hover
- CSV download via YASR's download interface

---

### Use Case 2: Wikidata Query Service

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  yasqe: {
    value: `SELECT ?item ?itemLabel ?birth ?death
WHERE {
  ?item wdt:P31 wd:Q5 ;          # instance of human
        wdt:P106 wd:Q901 ;        # occupation: scientist
        wdt:P569 ?birth ;         # date of birth
        wdt:P570 ?death .         # date of death
  FILTER(YEAR(?birth) >= 1900 && YEAR(?birth) < 2000)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?birth
LIMIT 100`,
    sparql: {
      endpoint: 'https://query.wikidata.org/sparql'
    }
  },
  yasr: {
    defaultPlugin: 'table',
    pluginConfig: {
      table: {
        displayConfig: {
          uriDisplayMode: 'abbreviated',
          showDatatypes: true,  // Show date datatypes
          ellipsisMode: false
        },
        tabulatorOptions: {
          layout: 'fitDataFill'  // Fit to container
        }
      }
    }
  }
});
```

**Features Enabled**:
- Date sorting (click "birth" column)
- Datatype visibility (xsd:date annotations)
- 100+ row virtual scrolling

---

### Use Case 3: Custom Endpoint with Authentication

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  yasqe: {
    sparql: {
      endpoint: 'https://api.example.com/sparql',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    }
  },
  yasr: {
    defaultPlugin: 'table',
    pluginConfig: {
      table: {
        persistenceKey: 'my-custom-endpoint-table',  // Separate storage key
        exportFormat: 'markdown',                    // Default to Markdown
        displayConfig: {
          uriDisplayMode: 'full',  // Always show full URIs
          showDatatypes: true,
          ellipsisMode: true
        }
      }
    }
  }
});
```

**Features**:
- Custom authentication headers
- Isolated localStorage (won't conflict with other instances)
- Markdown export format (also supports CSV and TSV)
- Full URI display
- Visual notifications for copy operations

---

## Advanced Integration

### Custom Cell Rendering

```javascript
// Register plugin with custom formatter
class CustomTablePlugin extends TablePlugin {
  generateColumns(vars) {
    const columns = super.generateColumns(vars);
    
    // Custom formatter for "email" column
    const emailColumn = columns.find(col => col.field === 'email');
    if (emailColumn) {
      emailColumn.formatter = (cell) => {
        const email = cell.getValue().value;
        return `<a href="mailto:${email}">${email}</a>`;
      };
    }
    
    return columns;
  }
}

Yasgui.Yasr.plugins.table = CustomTablePlugin;
```

**Effect**: Email addresses become clickable mailto: links

---

### External Search Control

```javascript
// Custom search input outside YASGUI
const searchInput = document.getElementById('externalSearch');
const yasr = yasgui.getTab().yasr;

searchInput.addEventListener('input', debounce((e) => {
  const tablePlugin = yasr.plugins['table'];
  if (tablePlugin && yasr.activePlugin === 'table') {
    tablePlugin.applyFilter(e.target.value);
  }
}, 300));

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
```

**Effect**: External search input controls table filtering

---

### Analytics Integration

```javascript
yasr.on('drawn', () => {
  const tablePlugin = yasr.plugins['table'];
  
  // Track plugin usage
  analytics.track('Table Plugin Loaded', {
    rowCount: tablePlugin.table?.getDataCount(),
    columnCount: tablePlugin.table?.getColumns().length
  });
  
  // Track search usage
  tablePlugin.on('search', (e) => {
    analytics.track('Table Search', {
      term: e.searchTerm,
      results: e.matchCount
    });
  });
  
  // Track copy operations
  tablePlugin.on('copy', (e) => {
    analytics.track('Table Copy', {
      format: e.format,
      rows: e.rowCount,
      success: e.success
    });
  });
});
```

---

## Troubleshooting

### Issue: Plugin Not Showing

**Symptom**: Table plugin not appearing in YASR selector.

**Solution**:
```javascript
// Check registration
console.log('Registered plugins:', Object.keys(Yasgui.Yasr.plugins));

// Ensure plugin is registered before YASGUI init
Yasgui.Yasr.plugins.table = TablePlugin;
const yasgui = new Yasgui(...);
```

---

### Issue: Styles Not Applied

**Symptom**: Table appears unstyled or broken layout.

**Solution**:
```html
<!-- Ensure CSS is loaded -->
<link rel="stylesheet" href="@matdata/yasgui-table-plugin/dist/table-plugin.min.css">

<!-- Check CSS loading order (YASGUI first, then plugin) -->
<link rel="stylesheet" href="@yasgui/yasgui/build/yasgui.min.css">
<link rel="stylesheet" href="@matdata/yasgui-table-plugin/dist/table-plugin.min.css">
```

---

### Issue: Configuration Not Persisting

**Symptom**: Display settings reset on page reload.

**Solution**:
```javascript
// Check localStorage availability
if (typeof localStorage === 'undefined') {
  console.error('localStorage not available');
}

// Check persistence enabled
const config = tablePlugin.getConfig();
console.log('Persistence enabled:', config.persistenceEnabled);

// Use custom storage key for isolation
{
  pluginConfig: {
    table: {
      persistenceKey: 'my-unique-key'
    }
  }
}
```

---

### Issue: Slow Performance with Large Results

**Symptom**: Table takes >2 seconds to render 10,000 rows.

**Solution**:
```javascript
// Ensure virtual scrolling enabled
{
  tabulatorOptions: {
    renderVertical: 'virtual',
    virtualDomBuffer: 300,  // Reduce if memory-constrained
    height: '600px'         // Fixed height required for virtual scrolling
  }
}

// Simplify formatters
{
  displayConfig: {
    ellipsisMode: true,      // Faster rendering
    showDatatypes: false     // Fewer DOM nodes
  }
}
```

---

### Issue: Clipboard Copy Fails

**Symptom**: Ctrl+C does not copy selection.

**Solution**:
```javascript
// Check HTTPS context (Clipboard API requires secure context)
console.log('Secure context:', window.isSecureContext);

// Automatic fallback to execCommand on HTTP or when Clipboard API fails
if (!window.isSecureContext) {
  console.warn('Clipboard API unavailable. Using legacy execCommand fallback.');
}

// Plugin automatically handles focus issues and fallbacks
// Visual notifications will indicate success or failure

// Check browser permissions
navigator.permissions.query({ name: 'clipboard-write' })
  .then(result => {
    console.log('Clipboard permission:', result.state);
  });
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core table rendering | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Virtual scrolling | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Clipboard API | ✅ 90+ | ✅ 90+ | ✅ 13.1+ | ✅ 90+ |
| CSS Grid | ✅ 57+ | ✅ 52+ | ✅ 10.1+ | ✅ 16+ |
| localStorage | ✅ All | ✅ All | ✅ All | ✅ All |

**Fallbacks**:
- Clipboard API → `document.execCommand('copy')` for HTTP contexts
- CSS Grid → Flexbox fallback (automatic via PostCSS)

---

## Next Steps

### Development Workflow

1. **Clone repository**: `git clone https://github.com/yasgui/table-plugin.git`
2. **Install dependencies**: `npm install`
3. **Run dev server**: `npm run dev` (opens demo at http://localhost:3000 with Vite)
4. **Run tests**: `npm test`
5. **Build**: `npm run build` (uses esbuild, outputs UMD and ESM to `dist/`)
6. **Watch mode**: `npm run dev:build` (esbuild watch mode for incremental builds)

### Further Reading

- [Full specification](spec.md) - Feature requirements and user stories
- [Data model](data-model.md) - SPARQL binding structures
- [Plugin API](contracts/plugin-api.md) - Complete API reference
- [Configuration schema](contracts/config-schema.md) - All config options
- [Event system](contracts/events.md) - Event contracts
- [Tabulator documentation](https://tabulator.info/) - Underlying library

### Example Repository

Full working examples: https://github.com/yasgui/table-plugin/tree/main/demo

---

## Support

- **Issues**: https://github.com/yasgui/table-plugin/issues
- **Discussions**: https://github.com/yasgui/table-plugin/discussions
- **YASGUI Documentation**: https://triply.cc/docs/yasgui

---

**Quickstart Complete** ✅  
Plugin ready for integration with YASGUI/YASR ecosystem.
