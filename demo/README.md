# YASGUI Table Plugin Demo

This demo showcases the advanced table plugin for YASGUI with interactive examples.

## Running the Demo

### Option 1: Vite Development Server (Recommended)

For development with hot module replacement and source maps:

```bash
# From project root
npm run dev
```

This starts a Vite dev server at `http://localhost:3000` with:
- ✅ Hot module replacement (instant updates)
- ✅ TypeScript source maps for debugging
- ✅ Plugin loaded directly from `src/` (no build step)
- ✅ Automatic browser refresh on changes

### Option 2: Direct File Access

Simply open `index.html` in your web browser. All dependencies are loaded from CDNs.

```bash
# On Windows
start demo/index.html

# On macOS
open demo/index.html

# On Linux
xdg-open demo/index.html
```

### Option 3: Other Local Servers

You can also use any static file server:

```bash
# Using Python 3
cd demo && python -m http.server 8000

# Using Node.js http-server
npx http-server demo -p 8000

# Using PHP
cd demo && php -S localhost:8000
```

## Features Demonstrated

### 1. **Virtual Scrolling**
- The "Large Dataset" tab shows 1,000 rows with smooth scrolling
- Table efficiently handles 10,000+ rows without performance issues

### 2. **Search & Filter**
- Type in the search box to filter rows in real-time
- Search works across all columns
- Row count updates to show filtered/total results

### 3. **Column Management**
- Click column headers to sort (ascending/descending)
- Drag column edges to resize
- Column widths persist in browser storage

### 4. **Display Controls**
- **URI Mode**: Toggle between full URIs and abbreviated (prefix:name)
- **Datatypes**: Show/hide datatype annotations (e.g., `^^xsd:date`)
- **Ellipsis**: Truncate long cell content with "..." (see "Datatypes Test" tab)

### 5. **Selection & Copy**
- Click any cell to select it
- Click row numbers to select entire rows
- Press `Ctrl+C` (or `Cmd+C` on Mac) to copy as TSV
- Press `Esc` to clear selection

### 6. **Export Options**
- **Markdown**: Copy table as pipe-separated Markdown
- **CSV**: Copy table as comma-separated values
- **Download CSV**: Save table to a timestamped CSV file
- Exports respect active search filter

### 7. **SPARQL-Aware Rendering**
- URIs displayed with clickable links
- Literals show datatypes when enabled
- Blank nodes displayed with special formatting
- Proper handling of language tags

## Sample Queries

### DBpedia People
Queries DBpedia for notable people born after 1950 with biographical information.

### Wikidata Cities
Queries Wikidata for major cities (population > 1M) with coordinates and country information.

### Datatypes Test
Demonstrates various SPARQL datatypes: strings, integers, dates, booleans, and URIs.

### Large Dataset
Tests virtual scrolling with 1,000 rows of data.

## Browser Compatibility

- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` / `Cmd+C` | Copy selected cells as TSV |
| `Esc` | Clear selection |
| `Ctrl+F` | Focus search box (browser default) |

## Troubleshooting

### Plugin doesn't load
- Check browser console for errors
- Ensure `../dist/table-plugin.umd.js` and `../dist/table-plugin.css` exist
- Run `npm run build` from project root to generate dist files

### SPARQL queries fail
- Check network tab for CORS errors
- Some endpoints may block requests from localhost
- Try different endpoints using the endpoint buttons in YASGUI

### Features not working
- Clear browser cache and reload
- Check that table plugin is the active visualization tab
- Some features require query results to be loaded first

## Development

To work on the plugin with live reload:

```bash
# Start Vite dev server (recommended)
npm run dev

# The server will automatically reload when you edit files in src/
# No manual refresh needed!
```

If you prefer to test with the production build:

```bash
# Build manually
npm run build

# Then open demo/index.html in your browser
# Refresh after each build to see changes
```
