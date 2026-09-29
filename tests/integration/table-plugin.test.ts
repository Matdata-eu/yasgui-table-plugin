/**
 * Integration tests for TablePlugin
 */

import TablePlugin from '../../src/TablePlugin';
import { SparqlResults } from '../../src/types/sparql';
import { ClipboardManager } from '../../src/features/clipboard';

describe('TablePlugin Integration', () => {
  let mockYasr: any;

  const sampleResults: SparqlResults = {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        {
          subject: { type: 'uri', value: 'http://example.org/subject' },
          predicate: { type: 'uri', value: 'http://example.org/predicate' },
          object: { type: 'literal', value: 'test value' },
        },
      ],
    },
  };

  beforeEach(() => {
    // Mock YASR instance
    mockYasr = {
      results: sampleResults,
      config: {
        pluginsOptions: {
          Table: {
            displayConfig: {
              showDatatypes: true,
              uriDisplayMode: 'abbreviated',
            },
          },
        },
      },
      rootEl: document.createElement('div'),
      pluginControls: document.createElement('div'),
    };
  });

  describe('Plugin Metadata', () => {
    it('should have correct priority', () => {
      expect(TablePlugin.priority).toBe(10);
    });

    it('should have correct label', () => {
      expect(TablePlugin.label).toBe('Table');
    });
  });

  describe('canHandleResults', () => {
    it('should handle valid SPARQL SELECT results', () => {
      const plugin = new TablePlugin(mockYasr);
      const result = plugin.canHandleResults();
      
      expect(result).toBe(true);
    });

    it('should reject results without head.vars', () => {
      mockYasr.results = {
        head: {},
        results: { bindings: [] },
      };
      
      const plugin = new TablePlugin(mockYasr);
      const result = plugin.canHandleResults();
      
      expect(result).toBe(false);
    });

    it('should reject results without bindings array', () => {
      mockYasr.results = {
        head: { vars: ['x'] },
        results: {},
      };
      
      const plugin = new TablePlugin(mockYasr);
      const result = plugin.canHandleResults();
      
      expect(result).toBe(false);
    });

    it('should reject empty variable list', () => {
      mockYasr.results = {
        head: { vars: [] },
        results: { bindings: [] },
      };
      
      const plugin = new TablePlugin(mockYasr);
      const result = plugin.canHandleResults();
      
      expect(result).toBe(false);
    });

    it('should reject null results', () => {
      mockYasr.results = null;
      
      const plugin = new TablePlugin(mockYasr);
      const result = plugin.canHandleResults();
      
      expect(result).toBe(false);
    });

    it('should handle YASR wrapped results', () => {
      mockYasr.results = { json: sampleResults };
      
      const plugin = new TablePlugin(mockYasr);
      const result = plugin.canHandleResults();
      
      expect(result).toBe(true);
    });
  });



  describe('getIcon', () => {
    it('should return an element', () => {
      const plugin = new TablePlugin(mockYasr);
      const icon = plugin.getIcon();
      
      expect(icon).toBeInstanceOf(Element);
    });

    it('should return an SVG element', () => {
      const plugin = new TablePlugin(mockYasr);
      const icon = plugin.getIcon();
      
      expect(icon?.tagName.toLowerCase()).toBe('svg');
    });
  });

  describe('Export respects search filter (#18)', () => {
    const allRows = [
      { _id: 0, _rowNum: 1, subject: { type: 'uri', value: 'http://ex.org/a' }, predicate: { type: 'uri', value: 'http://ex.org/p' }, object: { type: 'literal', value: 'alpha' } },
      { _id: 1, _rowNum: 2, subject: { type: 'uri', value: 'http://ex.org/b' }, predicate: { type: 'uri', value: 'http://ex.org/p' }, object: undefined },
    ];

    function pluginWithTable() {
      const plugin = new TablePlugin(mockYasr) as any;
      plugin.table = {
        // Simulate a search filter that keeps only the second row
        getData: jest.fn((filter?: string) => (filter === 'active' ? [allRows[1]] : allRows)),
      };
      plugin.clipboardManager = new ClipboardManager();
      return plugin;
    }

    it('exports only rows that pass the active filter', () => {
      const plugin = pluginWithTable();
      const csv = plugin.download('x.csv').getData();

      expect(plugin.table.getData).toHaveBeenCalledWith('active');
      expect(csv.split('\n')).toEqual([
        'subject,predicate,object',
        'http://ex.org/b,http://ex.org/p,',
      ]);
    });

    it('keeps columns aligned with the header order', () => {
      const plugin = pluginWithTable();
      plugin.table.getData = jest.fn(() => [
        { _id: 0, _rowNum: 1, object: { value: 'o' }, subject: { value: 's' }, predicate: { value: 'p' } },
      ]);

      const csv = plugin.download('x.csv').getData();
      expect(csv.split('\n')[1]).toBe('s,p,o');
    });
  });

  describe('Configuration', () => {
    it('should merge default config with plugin config', () => {
      const plugin = new TablePlugin(mockYasr);
      const config = plugin.getConfig();
      
      expect(config.displayConfig.showDatatypes).toBe(true);
      expect(config.displayConfig.uriDisplayMode).toBe('abbreviated');
    });

    it('should use default config when no plugin config provided', () => {
      mockYasr.config = {};
      const plugin = new TablePlugin(mockYasr);
      const config = plugin.getConfig();
      
      expect(config.displayConfig.showDatatypes).toBe(false);
    });
  });

  describe('Persistence', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should load persisted config on initialization', () => {
      const persistedConfig = {
        showDatatypes: true,
        columnWidths: { subject: 200 },
      };
      
      localStorage.setItem(
        'yasgui-table-default',
        JSON.stringify(persistedConfig)
      );
      
      mockYasr.config = {
        pluginsOptions: {
          Table: {
            persistenceEnabled: true,
          },
        },
      };
      
      const plugin = new TablePlugin(mockYasr);
      const config = plugin.getConfig();
      
      expect(config.displayConfig.showDatatypes).toBe(true);
      expect(config.displayConfig.columnWidths?.subject).toBe(200);
    });

    it('should skip persistence when disabled', () => {
      mockYasr.config = {
        pluginsOptions: {
          Table: {
            persistenceEnabled: false,
          },
        },
      };
      
      localStorage.setItem('yasgui-table-default', JSON.stringify({ showDatatypes: true }));
      
      const plugin = new TablePlugin(mockYasr);
      const config = plugin.getConfig();
      
      // Should use default, not persisted value
      expect(config.displayConfig.showDatatypes).toBe(false);
    });
  });
});
