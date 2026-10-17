/**
 * Fit Controls Component
 * Buttons to control column sizing behaviour – collapsed behind a "Fit" dropdown.
 */

import { closeAllDropdowns, registerDropdown } from '../utils/dropdown-manager.js';
import { icon } from '../utils/icons.js';

export interface FitControlsConfig {
  onFitToData: () => void;
  onFitToWindow: () => void;
  /**
   * Style the trigger for the yasr plugin toolbar slot (`.yasr_toolbarButton`)
   * instead of the plugin's own toolbar.
   */
  hostToolbar?: boolean;
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
    button.className = this.config.hostToolbar
      ? 'yasr_toolbarButton table-dropdown-trigger'
      : 'table-toggle-button table-dropdown-trigger';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('title', 'Fit column options');
    button.innerHTML = `<span>Fit</span>${icon('chevron-down', 12, 'table-dropdown-caret')}`;
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
