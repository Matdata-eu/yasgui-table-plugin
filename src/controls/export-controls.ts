/**
 * Export Controls Component
 * Buttons for exporting table data as Markdown, CSV, or downloading CSV file
 */

export interface ExportControlsConfig {
  onMarkdownExport?: () => void;
  onCsvExport?: () => void;
  onDownload?: () => void;
}

export class ExportControls {
  private container: HTMLDivElement;
  private markdownButton: HTMLButtonElement;
  private csvButton: HTMLButtonElement;
  private downloadButton: HTMLButtonElement;
  private config: ExportControlsConfig;

  constructor(config: ExportControlsConfig) {
    this.config = config;
    this.container = document.createElement('div');
    this.container.className = 'table-export-controls';
    this.container.setAttribute('aria-label', 'Export controls');

    // Create label
    const label = document.createElement('span');
    label.className = 'table-export-label';
    label.textContent = 'Export:';
    this.container.appendChild(label);

    // Create buttons
    this.markdownButton = this.createMarkdownButton();
    this.csvButton = this.createCsvButton();
    this.downloadButton = this.createDownloadButton();

    this.container.appendChild(this.markdownButton);
    this.container.appendChild(this.csvButton);
    this.container.appendChild(this.downloadButton);
  }

  private createMarkdownButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-export-button';
    button.textContent = 'Markdown';
    button.title = 'Copy table as Markdown to clipboard';
    button.setAttribute('aria-label', 'Copy as Markdown');
    button.addEventListener('click', () => {
      if (this.config.onMarkdownExport) {
        this.config.onMarkdownExport();
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
      if (this.config.onCsvExport) {
        this.config.onCsvExport();
      }
    });
    return button;
  }

  private createDownloadButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-export-button table-export-download';
    button.textContent = 'Download CSV';
    button.title = 'Download table as CSV file';
    button.setAttribute('aria-label', 'Download CSV file');
    button.addEventListener('click', () => {
      if (this.config.onDownload) {
        this.config.onDownload();
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
