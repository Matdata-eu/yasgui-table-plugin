/**
 * Blank Node Formatter
 * Formats blank node bindings with _:b0 style
 */

import { SparqlBinding } from '../types/sparql';
import { CellComponent } from '../types/tabulator';

export class BnodeFormatter {
  /**
   * Format blank node binding for display
   */
  format(cell: CellComponent): string | HTMLElement {
    const binding = cell.getValue() as SparqlBinding | undefined;

    if (!binding || binding.type !== 'bnode') {
      return '';
    }

    const container = document.createElement('span');
    container.className = 'table-bnode';
    container.textContent = binding.value;
    container.title = `Blank node: ${binding.value}`;

    return container;
  }
}
