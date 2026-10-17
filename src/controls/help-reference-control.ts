/**
 * Help Reference Control Component
 * Toolbar button that opens a quick reference card modal explaining table plugin features
 */

import { icon } from '../utils/icons.js';

interface HelpSection {
  title: string;
  description: string;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    title: 'Double-click a cell',
    description:
      'Double-click any table cell to open a popup with the full cell content. From there you can copy the content to the clipboard.',
  },
  {
    title: 'Search',
    description:
      'Type in the search bar to filter table rows. Only rows containing the search term in any column will be shown. The row count updates as you type.',
  },
  {
    title: 'URI display',
    description:
      'Use "URI: full / short" under Display (View settings in newer MatGUI versions) to show URIs as full IRIs or abbreviated with namespace prefixes.',
  },
  {
    title: 'Datatypes',
    description:
      'Toggle "Types" to show or hide the RDF datatype annotation on literal values (e.g. "42"^^xsd:integer).',
  },
  {
    title: 'Ellipsis mode',
    description:
      'Toggle "Ellipsis" to truncate long cell values so the table stays compact. Double-click a cell to see the full value.',
  },
  {
    title: 'Fit columns',
    description:
      '"Fit to data" resizes each column to fit its content. "Fit to window" stretches the columns to fill the available window width.',
  },
  {
    title: 'Export',
    description:
      'Copy the table data to the clipboard as CSV, TSV, or Markdown from the Copy menu. Only the rows that match the search are copied.',
  },
  {
    title: 'Explore a resource',
    description:
      'Ctrl+click (Cmd+click on macOS) a URI to show all triples where it is the subject. Ctrl+Shift+click shows all triples where it is the object. The result opens in the describe panel of newer MatGUI versions, or in a popup that runs the query in the background with the prefixes from your main query. Right-click a URI for the same options, or to run them as a new main query that replaces the current results.',
  },
  {
    title: 'Link prefix',
    description:
      'Set a custom URL prefix to make every URI in the table a clickable link that opens the URI in another application, e.g. a faceted browser.',
  },
];

export interface HelpReferenceControlConfig {
  /** Style the button for the yasr plugin toolbar slot (`.yasr_toolbarButton`). */
  hostToolbar?: boolean;
}

/**
 * Toolbar control that shows a help (circle-help) icon button.
 * Clicking it opens a quick reference card modal.
 */
export class HelpReferenceControl {
  private container: HTMLElement;
  private modal: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;
  private config: HelpReferenceControlConfig;

  constructor(config: HelpReferenceControlConfig = {}) {
    this.config = config;
    this.container = this.createContainer();
    this.container.appendChild(this.createHelpButton());
  }

  // ---- DOM builders -------------------------------------------------------

  private createContainer(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'table-help-reference-control';
    return el;
  }

  private createHelpButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = this.config.hostToolbar
      ? 'yasr_toolbarButton table-help-button'
      : 'table-toggle-button table-help-button';
    btn.setAttribute('aria-label', 'Open quick reference card');
    btn.setAttribute('title', 'Quick reference');
    btn.innerHTML = icon('circle-help');
    btn.addEventListener('click', () => this.openModal());
    return btn;
  }

  // ---- Modal ---------------------------------------------------------------

  private openModal(): void {
    // Prevent duplicate modals
    if (this.modal) return;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'table-modal-backdrop';
    this.backdrop.addEventListener('click', () => this.closeModal());

    this.modal = document.createElement('div');
    this.modal.className = 'table-modal table-help-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'table-help-modal-title');
    this.modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'table-modal-header';

    const title = document.createElement('h3');
    title.id = 'table-help-modal-title';
    title.className = 'table-modal-title';
    title.textContent = 'Quick reference';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'table-modal-close';
    closeBtn.innerHTML = icon('x');
    closeBtn.setAttribute('aria-label', 'Close quick reference');
    closeBtn.addEventListener('click', () => this.closeModal());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Content
    const content = document.createElement('div');
    content.className = 'table-modal-content table-help-modal-content';

    for (const section of HELP_SECTIONS) {
      content.appendChild(this.createSection(section));
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'table-modal-footer';

    const closeFooterBtn = document.createElement('button');
    closeFooterBtn.className = 'table-modal-button table-modal-button-secondary';
    closeFooterBtn.textContent = 'Close';
    closeFooterBtn.addEventListener('click', () => this.closeModal());

    footer.appendChild(closeFooterBtn);

    this.modal.appendChild(header);
    this.modal.appendChild(content);
    this.modal.appendChild(footer);

    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    document.addEventListener('keydown', this.handleEscape);

    closeBtn.focus();
  }

  private createSection(section: HelpSection): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-help-section';

    const heading = document.createElement('h4');
    heading.className = 'table-help-section-title';
    heading.textContent = section.title;

    const desc = document.createElement('p');
    desc.className = 'table-help-section-desc';
    desc.textContent = section.description;

    wrapper.appendChild(heading);
    wrapper.appendChild(desc);
    return wrapper;
  }

  private closeModal(): void {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    document.removeEventListener('keydown', this.handleEscape);
  }

  private handleEscape = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.closeModal();
    }
  };

  // ---- Public API ---------------------------------------------------------

  /**
   * Get the DOM element for rendering.
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Clean up.
   */
  destroy(): void {
    this.closeModal();
    this.container.remove();
  }
}
