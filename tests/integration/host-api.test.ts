/**
 * yasr host API adoption (MatGUI): shared describe panel and plugin toolbar
 * slot when yasr offers them, the plugin's own modal and toolbar otherwise.
 */

import TablePlugin from '../../src/TablePlugin';
import { SparqlResults } from '../../src/types/sparql';
import { getHostToolbar, hasHostDescribe, toHostDirection } from '../../src/utils/host-api';

jest.mock('tabulator-tables', () => ({
  TabulatorFull: jest.fn().mockImplementation((element: HTMLElement, config: any) => {
    const tabulatorDiv = document.createElement('div');
    tabulatorDiv.className = 'tabulator';
    element?.appendChild(tabulatorDiv);
    return {
      on: jest.fn().mockReturnThis(),
      off: jest.fn(),
      setData: jest.fn(),
      setFilter: jest.fn(),
      clearFilter: jest.fn(),
      setColumns: jest.fn(),
      redraw: jest.fn(),
      getColumns: jest.fn().mockReturnValue([]),
      getRows: jest.fn().mockReturnValue([]),
      getData: jest.fn().mockReturnValue(config?.data || []),
      getDataCount: jest.fn().mockReturnValue((config?.data || []).length),
      destroy: jest.fn(),
    };
  }),
}));

const IRI = 'http://example.org/subject';

const sampleResults: SparqlResults = {
  head: { vars: ['subject', 'object'] },
  results: {
    bindings: [
      {
        subject: { type: 'uri', value: IRI },
        object: { type: 'literal', value: 'test value' },
      },
    ],
  },
};

/** yasr as published today: no host API. */
function legacyYasr(): any {
  return {
    results: sampleResults,
    resultsEl: document.createElement('div'),
    config: { pluginsOptions: { Table: { persistenceEnabled: false } } },
    executeQuery: jest.fn(() => new Promise(() => undefined)),
  };
}

/** yasr with the host API (version 1). */
function hostYasr(): any {
  const slot = document.createElement('div');
  slot.className = 'yasr_pluginToolbar';
  return {
    ...legacyYasr(),
    hostApi: { version: 1, describe: true, toolbar: true },
    describe: jest.fn(() => Promise.resolve()),
    closeDescribe: jest.fn(),
    getPluginToolbar: jest.fn(() => slot),
    slot,
  };
}

/** Open the URI context menu and click one of its items. */
function clickContextMenuItem(plugin: any, label: string): void {
  plugin.handleUriContextMenu(IRI, 10, 10);
  const item = Array.from(document.querySelectorAll<HTMLButtonElement>('.table-uri-context-menu-item')).find(
    (el) => el.textContent?.startsWith(label)
  );
  expect(item).toBeDefined();
  item!.click();
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('host API feature detection', () => {
  it('detects the describe panel only when the flag and the function are both there', () => {
    expect(hasHostDescribe(hostYasr())).toBe(true);
    expect(hasHostDescribe(legacyYasr())).toBe(false);
    expect(hasHostDescribe({ ...hostYasr(), hostApi: { version: 1, describe: false, toolbar: true } })).toBe(false);
    expect(hasHostDescribe({ ...hostYasr(), describe: undefined })).toBe(false);
    expect(hasHostDescribe(null)).toBe(false);
  });

  it('returns the toolbar slot only when the flag and the function are both there', () => {
    const yasr = hostYasr();
    expect(getHostToolbar(yasr)).toBe(yasr.slot);
    expect(getHostToolbar(legacyYasr())).toBeNull();
    expect(getHostToolbar({ ...hostYasr(), hostApi: { version: 1, describe: true, toolbar: false } })).toBeNull();
    expect(getHostToolbar({ ...hostYasr(), getPluginToolbar: undefined })).toBeNull();
  });

  it('falls back when getPluginToolbar throws', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const yasr = { ...hostYasr(), getPluginToolbar: () => { throw new Error('boom'); } };
    expect(getHostToolbar(yasr)).toBeNull();
    warn.mockRestore();
  });

  it('maps subject/object to outgoing/incoming', () => {
    expect(toHostDirection('subject')).toBe('outgoing');
    expect(toHostDirection('object')).toBe('incoming');
  });
});

describe('describe', () => {
  describe('with the host API', () => {
    it('opens the yasr describe panel on Ctrl+click (outgoing)', async () => {
      const yasr = hostYasr();
      const plugin = new TablePlugin(yasr) as any;
      await plugin.draw();

      await plugin.handleUriCtrlClick(IRI, 'subject');

      expect(yasr.describe).toHaveBeenCalledWith(IRI, { direction: 'outgoing', source: 'Table', newHistory: true });
      expect(yasr.executeQuery).not.toHaveBeenCalled();
      expect(document.querySelector('.describe-modal')).toBeNull();
    });

    it('opens the yasr describe panel on Ctrl+Shift+click (incoming)', async () => {
      const yasr = hostYasr();
      const plugin = new TablePlugin(yasr) as any;
      await plugin.draw();

      await plugin.handleUriCtrlClick(IRI, 'object');

      expect(yasr.describe).toHaveBeenCalledWith(IRI, { direction: 'incoming', source: 'Table', newHistory: true });
    });

    it('uses the describe panel from the context menu too', async () => {
      const yasr = hostYasr();
      const plugin = new TablePlugin(yasr) as any;
      await plugin.draw();

      clickContextMenuItem(plugin, 'Triples as object');

      expect(yasr.describe).toHaveBeenCalledWith(IRI, { direction: 'incoming', source: 'Table', newHistory: true });
      expect(document.querySelector('.describe-modal')).toBeNull();
    });

    it('emits describeQuery, also when the panel fails', async () => {
      const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const yasr = hostYasr();
      const plugin = new TablePlugin(yasr) as any;
      await plugin.draw();
      const events: any[] = [];
      plugin.on('describeQuery', (e: any) => events.push(e));

      await plugin.handleUriCtrlClick(IRI, 'subject');
      yasr.describe.mockImplementationOnce(() => Promise.reject(new Error('nope')));
      await plugin.handleUriCtrlClick(IRI, 'subject');

      expect(events).toEqual([
        { uri: IRI, direction: 'subject', success: true, panel: 'host' },
        { uri: IRI, direction: 'subject', success: false, error: 'nope', panel: 'host' },
      ]);
      error.mockRestore();
    });
  });

  describe('without the host API (fallback)', () => {
    it('runs the background query and shows the plugin modal', async () => {
      const yasr = legacyYasr();
      const plugin = new TablePlugin(yasr) as any;
      await plugin.draw();

      plugin.handleUriCtrlClick(IRI, 'subject');

      expect(yasr.executeQuery).toHaveBeenCalledTimes(1);
      expect(yasr.executeQuery.mock.calls[0][1]).toMatchObject({ acceptHeader: 'text/turtle' });
      expect(document.querySelector('.describe-modal')).not.toBeNull();
    });

    it('ignores a describe function that the host API does not announce', async () => {
      const yasr = { ...legacyYasr(), describe: jest.fn() };
      const plugin = new TablePlugin(yasr) as any;
      await plugin.draw();

      clickContextMenuItem(plugin, 'Triples as subject');

      expect(yasr.describe).not.toHaveBeenCalled();
      expect(yasr.executeQuery).toHaveBeenCalledTimes(1);
      expect(document.querySelector('.describe-modal')).not.toBeNull();
    });
  });
});

describe('toolbar', () => {
  describe('with the host API', () => {
    it('renders the controls into the yasr toolbar slot with the shared classes', async () => {
      const yasr = hostYasr();
      const plugin = new TablePlugin(yasr);
      await plugin.draw();

      const slot: HTMLElement = yasr.slot;
      expect(yasr.resultsEl.querySelector('.table-controls-toolbar')).toBeNull();

      const search = slot.querySelector<HTMLInputElement>('input.yasr_toolbarSearch');
      expect(search).not.toBeNull();
      expect(search!.type).toBe('search');
      expect(search!.closest('.yasr_toolbarGroup')).not.toBeNull();

      const labels = Array.from(slot.querySelectorAll('.yasr_toolbarButton')).map((b) => b.textContent?.trim());
      expect(labels).toEqual(['Fit', 'Copy', 'Link: default', '', 'View settings']);
      expect(slot.querySelectorAll('.yasr_toolbarSpacer')).toHaveLength(1);
      expect(slot.querySelector('.table-toggle-button:not(.table-dropdown-item)')).toBeNull();
    });

    it('puts View settings with the sliders icon at the far right', async () => {
      const yasr = hostYasr();
      const plugin = new TablePlugin(yasr);
      await plugin.draw();

      const last = yasr.slot.lastElementChild as HTMLElement;
      const button = last.querySelector<HTMLButtonElement>('.yasr_toolbarButton')!;
      expect(button.textContent).toBe('View settings');
      expect(button.querySelector('svg.table-icon-sliders-horizontal')).not.toBeNull();
      // everything after the spacer: help, then view settings
      const children = Array.from(yasr.slot.children) as HTMLElement[];
      const spacerIndex = children.findIndex((c) => c.classList.contains('yasr_toolbarSpacer'));
      expect(children.indexOf(last)).toBeGreaterThan(spacerIndex);
    });

    it('opens the display options from View settings', async () => {
      const yasr = hostYasr();
      const plugin = new TablePlugin(yasr);
      await plugin.draw();

      const button = (yasr.slot.lastElementChild as HTMLElement).querySelector<HTMLButtonElement>('.yasr_toolbarButton')!;
      button.click();

      const panel = (yasr.slot.lastElementChild as HTMLElement).querySelector('.table-dropdown-panel')!;
      expect(panel.classList.contains('open')).toBe(true);
      expect(panel.classList.contains('table-dropdown-panel-end')).toBe(true);
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(panel.textContent).toContain('URI: full');
    });

    it('marks the link prefix button pressed when a prefix is set', async () => {
      const yasr = hostYasr();
      yasr.config.pluginsOptions.Table.displayConfig = { uriLinkPrefix: 'https://browse.example/?uri=' };
      const plugin = new TablePlugin(yasr);
      await plugin.draw();

      const slot: HTMLElement = yasr.slot;
      const link = Array.from(slot.querySelectorAll<HTMLButtonElement>('.yasr_toolbarButton')).find((b) =>
        b.textContent?.startsWith('Link')
      )!;
      expect(link.getAttribute('aria-pressed')).toBe('true');
    });

    it('does not duplicate its controls when it redraws itself', async () => {
      const yasr = hostYasr();
      const plugin = new TablePlugin(yasr);
      await plugin.draw();
      const count = yasr.slot.children.length;

      plugin.updateConfig({ displayConfig: { uriDisplayMode: 'abbreviated' } });
      await new Promise((resolve) => setTimeout(resolve, 0));
      await plugin.draw();

      expect(yasr.slot.children.length).toBe(count);
      expect(yasr.slot.querySelectorAll('.yasr_toolbarSearch')).toHaveLength(1);
    });

    it('removes its controls from the slot on destroy', async () => {
      const yasr = hostYasr();
      const plugin = new TablePlugin(yasr);
      await plugin.draw();
      expect(yasr.slot.children.length).toBeGreaterThan(0);

      plugin.destroy();

      expect(yasr.slot.children.length).toBe(0);
    });

    it('leaves the slot empty when there are no results', async () => {
      const yasr = hostYasr();
      yasr.results = { head: { vars: ['x'] }, results: { bindings: [] } };
      const plugin = new TablePlugin(yasr);
      await plugin.draw();

      expect(yasr.slot.children.length).toBe(0);
    });
  });

  describe('without the host API (fallback)', () => {
    it('draws its own toolbar above the table', async () => {
      const yasr = legacyYasr();
      const plugin = new TablePlugin(yasr);
      await plugin.draw();

      const toolbar = yasr.resultsEl.querySelector('.table-controls-toolbar');
      expect(toolbar).not.toBeNull();
      expect(toolbar.querySelector('input.table-search-input')).not.toBeNull();
      expect(toolbar.querySelector('.yasr_toolbarButton, .yasr_toolbarSearch, .yasr_toolbarSpacer')).toBeNull();
      const triggers = Array.from(toolbar.querySelectorAll('.table-dropdown-trigger')).map((b: any) => b.textContent.trim());
      expect(triggers).toEqual(['Display', 'Fit', 'Copy']);
    });

    it('draws its own toolbar when the host API has no toolbar slot', async () => {
      const yasr = { ...hostYasr(), hostApi: { version: 1, describe: true, toolbar: false } };
      const plugin = new TablePlugin(yasr);
      await plugin.draw();

      expect(yasr.resultsEl.querySelector('.table-controls-toolbar')).not.toBeNull();
      expect(yasr.getPluginToolbar).not.toHaveBeenCalled();
      expect(yasr.slot.children.length).toBe(0);
    });
  });
});

describe('icons', () => {
  it('uses Lucide stroke icons instead of glyphs', async () => {
    const yasr = legacyYasr();
    const plugin = new TablePlugin(yasr);
    const pluginIcon = plugin.getIcon()!;
    expect(pluginIcon.getAttribute('fill')).toBe('none');
    expect(pluginIcon.getAttribute('stroke')).toBe('currentColor');

    await plugin.draw();
    const help = yasr.resultsEl.querySelector('.table-help-button svg');
    expect(help.classList.contains('table-icon-circle-help')).toBe(true);
    yasr.resultsEl.querySelectorAll('.table-dropdown-caret').forEach((caret: Element) => {
      expect(caret.getAttribute('stroke')).toBe('currentColor');
    });
  });
});
