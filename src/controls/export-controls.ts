/**
 * Export Controls Component
 * Buttons for copying table data as Markdown, CSV, or TSV –
 * collapsed behind a "Copy" dropdown trigger button.
 */

import { closeAllDropdowns, registerDropdown } from '../utils/dropdown-manager.js';
import { icon } from '../utils/icons.js';

export interface ExportControlsConfig {
  onMarkdownCopy?: () => void;
  onCsvCopy?: () => void;
  onTsvCopy?: () => void;
  /**
   * Style the trigger for the yasr plugin toolbar slot (`.yasr_toolbarButton`)
   * instead of the plugin's own toolbar.
   */
  hostToolbar?: boolean;
}

export class ExportControls {
  private container: HTMLDivElement;
  private triggerButton: HTMLButtonElement;
  private panel: HTMLElement;
  private config: ExportControlsConfig;
  private isOpen = false;

  constructor(config: ExportControlsConfig) {
    this.config = config;
    this.container = document.createElement('div');
    this.container.className = 'table-export-controls table-dropdown-group';
    this.container.setAttribute('aria-label', 'Export controls');

    this.panel = this.createPanel();
    this.triggerButton = this.createTriggerButton();

    this.container.appendChild(this.triggerButton);
    this.container.appendChild(this.panel);

    registerDropdown(this);
  }

  private createTriggerButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = this.config.hostToolbar
      ? 'yasr_toolbarButton table-dropdown-trigger'
      : 'table-toggle-button table-dropdown-trigger';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('title', 'Copy table to clipboard');
    button.innerHTML = `<span>Copy</span>${icon('chevron-down', 12, 'table-dropdown-caret')}`;
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    return button;
  }

  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'table-dropdown-panel';
    panel.setAttribute('role', 'menu');
    panel.appendChild(this.createMarkdownButton());
    panel.appendChild(this.createCsvButton());
    panel.appendChild(this.createTsvButton());
    return panel;
  }

  private createMarkdownButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-export-button table-dropdown-item';
    button.textContent = 'Markdown';
    button.title = 'Copy table as Markdown to clipboard';
    button.setAttribute('aria-label', 'Copy as Markdown');
    button.addEventListener('click', () => this.config.onMarkdownCopy?.());
    return button;
  }

  private createCsvButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-export-button table-dropdown-item';
    button.textContent = 'CSV';
    button.title = 'Copy table as CSV to clipboard';
    button.setAttribute('aria-label', 'Copy as CSV');
    button.addEventListener('click', () => this.config.onCsvCopy?.());
    return button;
  }

  private createTsvButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-export-button table-dropdown-item';
    button.textContent = 'TSV';
    button.title = 'Copy table as TSV (tab-delimited) to clipboard';
    button.setAttribute('aria-label', 'Copy as TSV');
    button.addEventListener('click', () => this.config.onTsvCopy?.());
    return button;
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    closeAllDropdowns();
    this.isOpen = true;
    this.panel.classList.add('open');
    this.triggerButton.setAttribute('aria-expanded', 'true');
  }

  close(): void {
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.triggerButton.setAttribute('aria-expanded', 'false');
  }

  getElement(): HTMLDivElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
