import { createYasr, setupThemeToggle, showResults, triplesFromSelect } from './demo-host.js';
import { mockData, describeTriples, prefixes } from './mock-data.js';

/** What the picker offers, with a hint on what to try */
const CHOICES = [
  {
    key: 'people',
    label: 'People',
    hint: 'Sort, filter and resize columns. <kbd>Ctrl</kbd>+click an IRI to open it in the describe panel, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+click for its incoming triples.',
  },
  { key: 'datatypes', label: 'Datatypes', hint: 'Strings, numbers, dates, booleans, IRIs and a blank node. Show or hide datatypes in the toolbar.' },
  { key: 'decimals', label: 'Decimal places', hint: 'float, double and decimal values, rounded to the decimal places you set.' },
  { key: 'smartFormatters', label: 'Smart formatters', hint: 'Stars, percentages, images, colours, multi-line text and booleans are shown by column name and value.' },
  { key: 'ontology', label: 'Ontology types', hint: 'IRIs shown full, abbreviated with prefixes, or as labels.' },
  { key: 'unicode', label: 'Unicode and special characters', hint: 'Scripts, emoji and characters that need escaping.' },
  { key: 'large', label: 'Large result', hint: 'Scrolling and filtering on 1000 rows.' },
].filter((choice) => mockData[choice.key]);

/** Load the plugin from source while developing, from the build when deployed */
async function loadPlugin() {
  if (import.meta.env?.DEV) {
    const module = await import('@matdata/yasgui-table-plugin');
    return module.default;
  }
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './dist/yasgui-table-plugin.min.css';
  document.head.appendChild(css);
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = './dist/yasgui-table-plugin.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load dist/yasgui-table-plugin.min.js'));
    document.head.appendChild(script);
  });
  return window.TablePlugin?.default;
}

const TablePlugin = await loadPlugin();
// MatGUI registers its own copy as "Table"; this page shows the one from this repository
window.Yasgui.Yasr.registerPlugin('Table', TablePlugin);

setupThemeToggle(document.getElementById('theme-toggle'));

const params = new URLSearchParams(window.location.search);
let current = mockData[params.get('dataset')] ? params.get('dataset') : CHOICES[0].key;

const yasr = createYasr(document.getElementById('yasr'), {
  plugin: 'Table',
  getPrefixes: () => prefixes,
  getTriples: () => [...describeTriples, ...triplesFromSelect(mockData[current])],
});

const select = document.getElementById('dataset');
const hint = document.getElementById('dataset-hint');
for (const choice of CHOICES) {
  const option = document.createElement('option');
  option.value = choice.key;
  option.textContent = `${choice.label} (${mockData[choice.key].results.bindings.length} rows)`;
  select.appendChild(option);
}

function load(key) {
  current = key;
  select.value = key;
  hint.innerHTML = CHOICES.find((choice) => choice.key === key)?.hint || '';
  yasr.closeDescribe?.();
  showResults(yasr, mockData[key]);
  const url = new URL(window.location.href);
  url.searchParams.set('dataset', key);
  window.history.replaceState(null, '', url);
}

select.addEventListener('change', () => load(select.value));
load(current);

window.yasr = yasr;
