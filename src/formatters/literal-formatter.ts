/**
 * Literal Formatter
 * Formats literal bindings with optional datatype annotations
 */

import { SparqlBinding } from '../types/sparql';
import { CellComponent } from '../types/tabulator';

/** XSD datatypes that support fraction-digit formatting */
const DECIMAL_DATATYPES = new Set([
  'http://www.w3.org/2001/XMLSchema#float',
  'http://www.w3.org/2001/XMLSchema#double',
  'http://www.w3.org/2001/XMLSchema#decimal',
]);

export class LiteralFormatter {
  private showDatatypes: boolean;
  private decimalPlaces?: number;

  constructor(showDatatypes = false, decimalPlaces?: number) {
    this.showDatatypes = showDatatypes;
    this.decimalPlaces = decimalPlaces;
  }

  /**
   * Format xsd:boolean literal as a tick or cross icon
   */
  formatBoolean(value: string): HTMLElement {
    const isTrue = value === 'true' || value === '1';
    const span = document.createElement('span');
    span.className = isTrue ? 'table-tick-cross table-tick' : 'table-tick-cross table-cross';
    span.textContent = isTrue ? '✔' : '✘';
    span.title = value;
    return span;
  }

  /**
   * Format literal binding for display
   */
  format(cell: CellComponent): string | HTMLElement {
    const binding = cell.getValue() as SparqlBinding | undefined;

    if (!binding || binding.type !== 'literal') {
      return '';
    }

    // XSD boolean → tick/cross (always active as a default formatter by datatype)
    if (binding.datatype === 'http://www.w3.org/2001/XMLSchema#boolean') {
      return this.formatBoolean(binding.value);
    }

    const container = document.createElement('span');
    container.className = 'table-literal';

    // Main value (rounded when a fixed number of fraction digits is configured)
    const valueSpan = document.createElement('span');
    valueSpan.className = 'table-literal-value';
    valueSpan.textContent = this.formatValue(binding);
    container.appendChild(valueSpan);

    // Language tag
    if (binding['xml:lang']) {
      const langSpan = document.createElement('span');
      langSpan.className = 'table-literal-lang';
      langSpan.textContent = `@${binding['xml:lang']}`;
      langSpan.title = `Language: ${binding['xml:lang']}`;
      container.appendChild(langSpan);
    }

    // Datatype annotation
    if (this.showDatatypes && binding.datatype) {
      const datatypeSpan = document.createElement('span');
      datatypeSpan.className = 'table-literal-datatype';
      const shortType = this.abbreviateDatatype(binding.datatype);
      datatypeSpan.textContent = `^^${shortType}`;
      datatypeSpan.title = `Datatype: ${binding.datatype}`;
      container.appendChild(datatypeSpan);
    }

    return container;
  }

  /**
   * Format the raw literal value, applying fraction-digit rounding for
   * xsd:float, xsd:double and xsd:decimal when decimalPlaces is configured.
   * Non-numeric values are returned unchanged.
   */
  private formatValue(binding: SparqlBinding): string {
    if (
      this.decimalPlaces === undefined ||
      !binding.datatype ||
      !DECIMAL_DATATYPES.has(binding.datatype)
    ) {
      return binding.value;
    }

    const num = Number(binding.value);
    if (!Number.isFinite(num)) {
      return binding.value;
    }

    return num.toFixed(this.decimalPlaces);
  }

  /**
   * Abbreviate XSD datatype URIs
   */
  private abbreviateDatatype(datatype: string): string {
    const xsdPrefix = 'http://www.w3.org/2001/XMLSchema#';
    if (datatype.startsWith(xsdPrefix)) {
      return `xsd:${datatype.substring(xsdPrefix.length)}`;
    }

    // Fallback: extract local name
    const lastHash = datatype.lastIndexOf('#');
    const lastSlash = datatype.lastIndexOf('/');
    const splitIndex = Math.max(lastHash, lastSlash);

    if (splitIndex > 0) {
      return datatype.substring(splitIndex + 1);
    }

    return datatype;
  }

  /**
   * Update datatype display setting
   */
  setShowDatatypes(show: boolean): void {
    this.showDatatypes = show;
  }

  /**
   * Update the fixed number of fraction digits (undefined = raw value)
   */
  setDecimalPlaces(places?: number): void {
    this.decimalPlaces = places;
  }
}
