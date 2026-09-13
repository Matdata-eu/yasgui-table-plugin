/**
 * DESCRIBE results modal
 *
 * Displays the result of a background DESCRIBE query in a popup window.
 * Parsed triples are shown in a table; the raw response text is available on a
 * separate tab.
 */

import { DescribeParseResult, DescribeTriple, formatDescribeObject } from '../parsers/describe-parser';

export type DescribeModalTab = 'triples' | 'raw';

export class DescribeModal {
  private backdrop: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private contentArea: HTMLElement | null = null;
  private currentTab: DescribeModalTab = 'triples';
  private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

  /**
   * Show the modal in a loading state.
   */
  showLoading(uri: string): void {
    this.render(uri, { state: 'loading' });
  }

  /**
   * Show the modal with parsed DESCRIBE results.
   */
  showResults(uri: string, result: DescribeParseResult): void {
    this.currentTab = result.triples.length > 0 ? 'triples' : 'raw';
    this.render(uri, { state: 'results', result });
  }

  /**
   * Show the modal after a query error.
   */
  showError(uri: string, error: unknown, raw?: string): void {
    this.currentTab = 'raw';
    this.render(uri, { state: 'error', error, raw: raw || '' });
  }

  /**
   * Close the modal and clean up event listeners.
   */
  close(): void {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
    this.contentArea = null;
  }

  private render(
    uri: string,
    payload:
      | { state: 'loading' }
      | { state: 'results'; result: DescribeParseResult }
      | { state: 'error'; error: unknown; raw: string }
  ): void {
    this.close();

    // Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'table-modal-backdrop describe-modal-backdrop';
    this.backdrop.addEventListener('click', () => this.close());

    // Modal container
    this.modal = document.createElement('div');
    this.modal.className = 'table-modal describe-modal';
    this.modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'table-modal-header describe-modal-header';

    const title = document.createElement('h3');
    title.className = 'table-modal-title';
    title.textContent = `DESCRIBE: ${this.abbreviateUri(uri)}`;
    title.title = uri;

    const closeButton = document.createElement('button');
    closeButton.className = 'table-modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close modal');
    closeButton.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeButton);

    // Content area
    this.contentArea = document.createElement('div');
    this.contentArea.className = 'table-modal-content describe-modal-content';

    if (payload.state === 'loading') {
      this.contentArea.appendChild(this.createLoadingView());
    } else if (payload.state === 'error') {
      this.contentArea.appendChild(this.createErrorView(payload.error, payload.raw));
    } else {
      this.contentArea.appendChild(this.createResultsView(payload.result));
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'table-modal-footer describe-modal-footer';

    const copyButton = document.createElement('button');
    copyButton.className = 'table-modal-button';
    copyButton.textContent = 'Copy Raw';
    copyButton.addEventListener('click', () => {
      const rawText = payload.state === 'results' ? payload.result.raw : payload.state === 'error' ? payload.raw : '';
      this.copyToClipboard(rawText);
    });

    const closeFooterButton = document.createElement('button');
    closeFooterButton.className = 'table-modal-button table-modal-button-secondary';
    closeFooterButton.textContent = 'Close';
    closeFooterButton.addEventListener('click', () => this.close());

    footer.appendChild(copyButton);
    footer.appendChild(closeFooterButton);

    this.modal.appendChild(header);
    this.modal.appendChild(this.contentArea);
    this.modal.appendChild(footer);

    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);

    closeButton.focus();
  }

  private createLoadingView(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'describe-modal-loading';

    const spinner = document.createElement('div');
    spinner.className = 'describe-modal-spinner';

    const text = document.createElement('p');
    text.textContent = 'Running DESCRIBE query…';

    container.appendChild(spinner);
    container.appendChild(text);
    return container;
  }

  private createErrorView(error: unknown, raw: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'describe-modal-error';

    const message = document.createElement('p');
    message.textContent = `Failed to run DESCRIBE query: ${this.errorMessage(error)}`;

    container.appendChild(message);

    if (raw) {
      container.appendChild(this.createRawSection(raw));
    }

    return container;
  }

  private createResultsView(result: DescribeParseResult): HTMLElement {
    const container = document.createElement('div');
    container.className = 'describe-modal-results';

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'describe-modal-tabs';

    const triplesTab = document.createElement('button');
    triplesTab.className = `describe-modal-tab ${this.currentTab === 'triples' ? 'active' : ''}`;
    triplesTab.textContent = `Triples (${result.triples.length})`;
    triplesTab.addEventListener('click', () => {
      this.currentTab = 'triples';
      this.refreshResultsView(result);
    });

    const rawTab = document.createElement('button');
    rawTab.className = `describe-modal-tab ${this.currentTab === 'raw' ? 'active' : ''}`;
    rawTab.textContent = 'Raw';
    rawTab.addEventListener('click', () => {
      this.currentTab = 'raw';
      this.refreshResultsView(result);
    });

    tabs.appendChild(triplesTab);
    tabs.appendChild(rawTab);
    container.appendChild(tabs);

    // Tab content
    const tabContent = document.createElement('div');
    tabContent.className = 'describe-modal-tab-content';

    if (this.currentTab === 'triples') {
      if (result.triples.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'describe-modal-empty';
        empty.textContent = 'No triples could be parsed from the response.';
        tabContent.appendChild(empty);
      } else {
        tabContent.appendChild(this.createTriplesTable(result.triples));
      }
    } else {
      tabContent.appendChild(this.createRawSection(result.raw));
    }

    container.appendChild(tabContent);
    return container;
  }

  private refreshResultsView(result: DescribeParseResult): void {
    if (!this.contentArea) {
      return;
    }
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(this.createResultsView(result));
  }

  private createTriplesTable(triples: DescribeTriple[]): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'describe-modal-table-wrapper';

    const table = document.createElement('table');
    table.className = 'describe-modal-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (const label of ['Subject', 'Predicate', 'Object']) {
      const th = document.createElement('th');
      th.textContent = label;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const triple of triples) {
      const row = document.createElement('tr');

      const subjectCell = document.createElement('td');
      subjectCell.textContent = triple.subject;
      subjectCell.title = triple.subject;
      row.appendChild(subjectCell);

      const predicateCell = document.createElement('td');
      predicateCell.textContent = triple.predicate;
      predicateCell.title = triple.predicate;
      row.appendChild(predicateCell);

      const objectCell = document.createElement('td');
      const objectText = formatDescribeObject(triple.object);
      objectCell.textContent = objectText;
      objectCell.title = objectText;
      row.appendChild(objectCell);

      tbody.appendChild(row);
    }
    table.appendChild(tbody);

    wrapper.appendChild(table);
    return wrapper;
  }

  private createRawSection(raw: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'describe-modal-raw';

    if (!raw.trim()) {
      const empty = document.createElement('p');
      empty.className = 'describe-modal-empty';
      empty.textContent = 'No raw response text available.';
      wrapper.appendChild(empty);
      return wrapper;
    }

    const pre = document.createElement('pre');
    pre.textContent = raw;
    wrapper.appendChild(pre);
    return wrapper;
  }

  private abbreviateUri(uri: string): string {
    if (uri.length <= 60) {
      return uri;
    }
    return uri.slice(0, 30) + '…' + uri.slice(-25);
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error';
  }

  private async copyToClipboard(content: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (error) {
      console.error('Failed to copy raw response to clipboard:', error);
    }
  }
}
