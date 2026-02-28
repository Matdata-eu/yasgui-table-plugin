/**
 * Fit Controls Component
 * Buttons to control column sizing behaviour – collapsed behind a "Fit" dropdown.
 */

import { closeAllDropdowns, registerDropdown } from '../utils/dropdown-manager.js';

export interface FitControlsConfig {
  onFitToData: () => void;
  onFitToWindow: () => void;
}

export class FitControls {
  private container: HTMLElement;
  private triggerButton: HTMLButtonElement;
  private panel: HTMLElement;
  private config: FitControlsConfig;
  private isOpen = false;

  constructor(config: FitControlsConfig) {
    this.config = config;
    this.container = this.createContainer();
    this.panel = this.createPanel();
    this.triggerButton = this.createTriggerButton();

    this.container.appendChild(this.triggerButton);
    this.container.appendChild(this.panel);

    registerDropdown(this);
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'table-fit-controls table-dropdown-group';
    return container;
  }

  private createTriggerButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-toggle-button table-dropdown-trigger';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('title', 'Fit column options');
    button.innerHTML = 'Fit <svg class="table-dropdown-caret" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>';
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
    panel.appendChild(this.createFitToDataButton());
    panel.appendChild(this.createFitToWindowButton());
    return panel;
  }

  private createFitToDataButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-fit-button table-dropdown-item';
    button.textContent = 'Fit to data';
    button.setAttribute('aria-label', 'Fit columns to data');
    button.setAttribute('title', 'Adjust column widths to fit content');
    button.addEventListener('click', () => this.config.onFitToData());
    return button;
  }

  private createFitToWindowButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-fit-button table-dropdown-item';
    button.textContent = 'Fit to window';
    button.setAttribute('aria-label', 'Fit columns to window');
    button.setAttribute('title', 'Stretch columns to fill available space');
    button.addEventListener('click', () => this.config.onFitToWindow());
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

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
