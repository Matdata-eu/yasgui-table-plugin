/**
 * Export Controls Component
 * Buttons for copying table data as Markdown or CSV to clipboard
 */

export interface ExportControlsConfig {
  onMarkdownCopy?: () => void;
  onCsvCopy?: () => void;
}

export class ExportControls {
  private container: HTMLDivElement;
  private markdownButton: HTMLButtonElement;
  private csvButton: HTMLButtonElement;
  private config: ExportControlsConfig;

  constructor(config: ExportControlsConfig) {
    this.config = config;
    this.container = document.createElement('div');
    this.container.className = 'table-export-controls';
    this.container.setAttribute('aria-label', 'Export controls');

    // Create label
    const label = document.createElement('span');
    label.className = 'table-export-label';
    label.textContent = 'Copy:';
    this.container.appendChild(label);

    // Create buttons
    this.markdownButton = this.createMarkdownButton();
    this.csvButton = this.createCsvButton();

    this.container.appendChild(this.markdownButton);
    this.container.appendChild(this.csvButton);
  }

  private createMarkdownButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-export-button';
    button.textContent = 'Markdown';
    button.title = 'Copy table as Markdown to clipboard';
    button.setAttribute('aria-label', 'Copy as Markdown');
    button.addEventListener('click', () => {
      if (this.config.onMarkdownCopy) {
        this.config.onMarkdownCopy();
      }
    });
    return button;
  }

  private createCsvButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-export-button';
    button.textContent = 'CSV';
    button.title = 'Copy table as CSV to clipboard';
    button.setAttribute('aria-label', 'Copy as CSV');
    button.addEventListener('click', () => {
      if (this.config.onCsvCopy) {
        this.config.onCsvCopy();
      }
    });
    return button;
  }

  getElement(): HTMLDivElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
