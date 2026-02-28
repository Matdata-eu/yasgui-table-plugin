/**
 * Help Reference Control Component
 * Toolbar button that opens a quick reference card modal explaining table plugin features
 */

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
    title: 'URI Display',
    description:
      'Use the "Full URI / Prefix / Local" toggle to switch how URIs are displayed: as full IRIs, using namespace prefixes, or as local names only.',
  },
  {
    title: 'Datatypes',
    description:
      'Toggle the "Datatypes" button to show or hide the RDF datatype annotation on literal values (e.g. "42"^^xsd:integer).',
  },
  {
    title: 'Ellipsis mode',
    description:
      'Toggle "Ellipsis" to truncate long cell values so the table stays compact. Double-click a cell to see the full value.',
  },
  {
    title: 'Fit columns',
    description:
      '"Fit: Data" resizes each column to fit its content. "Fit: Window" stretches the columns to fill the available window width.',
  },
  {
    title: 'Export',
    description:
      'Copy the table data to the clipboard as CSV, TSV, or Markdown by clicking the corresponding button in the Export section.',
  },
  {
    title: 'Link prefix',
    description:
      'Set a custom URL prefix to make every URI in the table a clickable link that opens the URI in another application, e.g. a faceted browser.',
  },
];

/**
 * Toolbar control that shows a help (❓) icon button.
 * Clicking it opens a quick reference card modal.
 */
export class HelpReferenceControl {
  private container: HTMLElement;
  private modal: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;

  constructor() {
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
    btn.className = 'table-toggle-button table-help-button';
    btn.setAttribute('aria-label', 'Open quick reference card');
    btn.setAttribute('title', 'Quick reference');
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>';
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
    title.textContent = 'Quick Reference';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'table-modal-close';
    closeBtn.innerHTML = '&times;';
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
