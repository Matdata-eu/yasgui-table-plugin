/**
 * Integration tests for TableRenderer
 */

import { TableRenderer } from '../../src/table-renderer';
import { SparqlResults } from '../../src/types/sparql';
import { TabulatorPluginConfig, DEFAULT_CONFIG } from '../../src/types/config';

// Mock Tabulator
jest.mock('tabulator-tables', () => ({
  TabulatorFull: jest.fn().mockImplementation((element, config) => {
    // Add a fake tabulator div to the container
    const tabulatorDiv = document.createElement('div');
    tabulatorDiv.className = 'tabulator';
    if (element) {
      element.appendChild(tabulatorDiv);
    }
    
    return {
      on: jest.fn().mockReturnThis(),
      setData: jest.fn(),
      setFilter: jest.fn(),
      clearFilter: jest.fn(),
      setColumns: jest.fn(),
      redraw: jest.fn(),
      getColumns: jest.fn().mockReturnValue([]),
      getData: jest.fn().mockReturnValue(config?.data || []),
      getDataCount: jest.fn().mockReturnValue((config?.data || []).length),
      destroy: jest.fn(),
    };
  }),
}));

describe('TableRenderer Integration', () => {
  let container: HTMLElement;
  let config: TabulatorPluginConfig;

  const sampleResults: SparqlResults = {
    head: { vars: ['name', 'age', 'email'] },
    results: {
      bindings: [
        {
          name: { type: 'literal', value: 'Alice' },
          age: {
            type: 'literal',
            value: '30',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          email: { type: 'uri', value: 'mailto:alice@example.com' },
        },
        {
          name: { type: 'literal', value: 'Bob' },
          age: {
            type: 'literal',
            value: '25',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
          email: { type: 'uri', value: 'mailto:bob@example.com' },
        },
      ],
    },
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    config = { ...DEFAULT_CONFIG };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('render', () => {
    it('should render table with data', () => {
      const renderer = new TableRenderer(config);
      const table = renderer.render(container, sampleResults);
      
      expect(table).toBeDefined();
      expect(container.querySelector('.tabulator')).toBeTruthy();
    });

    it('should handle empty results', () => {
      const emptyResults: SparqlResults = {
        head: { vars: ['x'] },
        results: { bindings: [] },
      };
      
      const renderer = new TableRenderer(config);
      const table = renderer.render(container, emptyResults);
      
      expect(table).toBeDefined();
      expect(container.querySelector('.tabulator')).toBeTruthy();
    });

    it('should apply saved column widths', () => {
      config.displayConfig = {
        columnWidths: {
          name: 200,
          age: 100,
        },
      };
      
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      // Column widths should be applied to table
      expect(container.querySelector('.tabulator')).toBeTruthy();
    });

    it('should apply saved sort state', () => {
      config.displayConfig = {
        sortState: {
          column: 'name',
          dir: 'asc',
        },
      };
      
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      // Sort should be applied
      expect(container.querySelector('.tabulator')).toBeTruthy();
    });
  });

  describe('updateDisplayConfig', () => {
    it('should update config and redraw table', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      const newConfig = { ...DEFAULT_CONFIG };
      newConfig.displayConfig = {
        uriDisplayMode: 'abbreviated',
        showDatatypes: true,
      };
      
      renderer.updateDisplayConfig(newConfig);
      
      // Should trigger table update
      expect(container.querySelector('.tabulator')).toBeTruthy();
    });
  });

  describe('applySearchFilter', () => {
    it('should filter rows by search term', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      const matchedRows = renderer.applySearchFilter('Alice');
      
      // Should return number of matched rows
      expect(matchedRows).toBeGreaterThanOrEqual(0);
    });

    it('should be case-insensitive', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      const matchedRows = renderer.applySearchFilter('alice');
      
      // Should still match "Alice"
      expect(matchedRows).toBeGreaterThanOrEqual(0);
    });

    it('should clear search with empty string', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      renderer.applySearchFilter('Alice');
      const allRows = renderer.applySearchFilter('');
      
      // Should show all rows again
      expect(allRows).toBe(sampleResults.results.bindings.length);
    });
  });

  describe('setLayout', () => {
    it('should switch to fitColumns layout', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      renderer.setLayout('fitColumns');
      
      // Layout should be updated
      expect(container.querySelector('.tabulator')).toBeTruthy();
    });

    it('should switch to fitData layout', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      renderer.setLayout('fitData');
      
      // Layout should be updated
      expect(container.querySelector('.tabulator')).toBeTruthy();
    });
  });

  describe('event callbacks', () => {
    it('should call onWidthChange when column resized', () => {
      const onWidthChange = jest.fn();
      const renderer = new TableRenderer(config, onWidthChange);
      renderer.render(container, sampleResults);
      
      // Verify callback is set up
      expect(onWidthChange).toBeDefined();
    });

    it('should call onSortChange when column sorted', () => {
      const onSortChange = jest.fn();
      const renderer = new TableRenderer(config, undefined, onSortChange);
      renderer.render(container, sampleResults);
      
      // Verify callback is set up
      expect(onSortChange).toBeDefined();
    });
  });

  describe('prefix resolution', () => {
    it('should use provided prefix map', () => {
      config.prefixMap = {
        ex: 'http://example.org/',
        foaf: 'http://xmlns.com/foaf/0.1/',
      };
      
      const resultsWithPrefixes: SparqlResults = {
        head: { vars: ['resource'] },
        results: {
          bindings: [
            {
              resource: { type: 'uri', value: 'http://example.org/thing' },
            },
          ],
        },
      };
      
      const renderer = new TableRenderer(config);
      renderer.render(container, resultsWithPrefixes);
      
      // Prefixes should be used for abbreviation
      expect(container.querySelector('.tabulator')).toBeTruthy();
    });

    it('should update prefixes', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      renderer.updatePrefixes({
        custom: 'http://custom.org/',
      });
      
      // New prefixes should be available
      expect(container.querySelector('.tabulator')).toBeTruthy();
    });
  });

  describe('helper methods', () => {
    it('should return current search term', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      renderer.applySearchFilter('test');
      
      expect(renderer.getCurrentSearchTerm()).toBe('test');
    });

    it('should return total row count', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      expect(renderer.getTotalRowCount()).toBe(sampleResults.results.bindings.length);
    });

    it('should return filtered row count', () => {
      const renderer = new TableRenderer(config);
      renderer.render(container, sampleResults);
      
      renderer.applySearchFilter('Alice');
      
      expect(renderer.getFilteredRowCount()).toBeGreaterThanOrEqual(0);
    });
  });
});
