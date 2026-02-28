/**
 * Display Controls Component
 * Toggle buttons for URI display mode, datatype visibility, and ellipsis mode –
 * collapsed behind a "Display" dropdown trigger button.
 */

import { closeAllDropdowns, registerDropdown } from '../utils/dropdown-manager.js';

export interface DisplayControlsConfig {
  uriDisplayMode: 'full' | 'abbreviated';
  showDatatypes: boolean;
  ellipsisMode: boolean;
  onUriDisplayChange: (mode: 'full' | 'abbreviated') => void;
  onShowDatatypesChange: (show: boolean) => void;
  onEllipsisModeChange: (enabled: boolean) => void;
}

export class DisplayControls {
  private container: HTMLElement;
  private triggerButton: HTMLButtonElement;
  private panel: HTMLElement;
  private uriToggle: HTMLButtonElement;
  private datatypeToggle: HTMLButtonElement;
  private ellipsisToggle: HTMLButtonElement;
  private config: DisplayControlsConfig;
  private isOpen = false;

  constructor(config: DisplayControlsConfig) {
    this.config = config;
    this.container = this.createContainer();
    this.uriToggle = this.createUriToggle();
    this.datatypeToggle = this.createDatatypeToggle();
    this.ellipsisToggle = this.createEllipsisToggle();
    this.panel = this.createPanel();
    this.triggerButton = this.createTriggerButton();

    this.container.appendChild(this.triggerButton);
    this.container.appendChild(this.panel);

    registerDropdown(this);
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'table-display-controls table-dropdown-group';
    return container;
  }

  private createTriggerButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-toggle-button table-dropdown-trigger';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('title', 'Display options');
    button.innerHTML = 'Display <svg class="table-dropdown-caret" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>';
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
    panel.appendChild(this.uriToggle);
    panel.appendChild(this.datatypeToggle);
    panel.appendChild(this.ellipsisToggle);
    return panel;
  }

  private createUriToggle(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-toggle-button table-dropdown-item';
    button.setAttribute('aria-label', 'Toggle URI display mode');
    button.setAttribute('title', 'Toggle between full and abbreviated URIs');
    this.updateUriToggleText(button, this.config.uriDisplayMode);
    button.addEventListener('click', () => {
      const newMode = this.config.uriDisplayMode === 'full' ? 'abbreviated' : 'full';
      this.config.uriDisplayMode = newMode;
      this.updateUriToggleText(button, newMode);
      this.config.onUriDisplayChange(newMode);
    });
    return button;
  }

  private createDatatypeToggle(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-toggle-button table-dropdown-item';
    button.setAttribute('aria-label', 'Toggle datatype display');
    button.setAttribute('title', 'Show or hide datatype annotations');
    this.updateDatatypeToggleText(button, this.config.showDatatypes);
    button.addEventListener('click', () => {
      const newShow = !this.config.showDatatypes;
      this.config.showDatatypes = newShow;
      this.updateDatatypeToggleText(button, newShow);
      this.config.onShowDatatypesChange(newShow);
    });
    return button;
  }

  private createEllipsisToggle(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-toggle-button table-dropdown-item';
    button.setAttribute('aria-label', 'Toggle ellipsis mode');
    button.setAttribute('title', 'Truncate long content with ellipsis');
    this.updateEllipsisToggleText(button, this.config.ellipsisMode);
    button.addEventListener('click', () => {
      const newEnabled = !this.config.ellipsisMode;
      this.config.ellipsisMode = newEnabled;
      this.updateEllipsisToggleText(button, newEnabled);
      this.config.onEllipsisModeChange(newEnabled);
    });
    return button;
  }

  private updateUriToggleText(button: HTMLButtonElement, mode: 'full' | 'abbreviated'): void {
    button.textContent = mode === 'full' ? 'URI: Full' : 'URI: Short';
    button.classList.toggle('active', mode === 'abbreviated');
  }

  private updateDatatypeToggleText(button: HTMLButtonElement, show: boolean): void {
    button.textContent = show ? 'Types: On' : 'Types: Off';
    button.classList.toggle('active', !show);
  }

  private updateEllipsisToggleText(button: HTMLButtonElement, enabled: boolean): void {
    button.textContent = enabled ? 'Ellipsis: On' : 'Ellipsis: Off';
    button.classList.toggle('active', enabled);
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

  setUriDisplayMode(mode: 'full' | 'abbreviated'): void {
    this.config.uriDisplayMode = mode;
    this.updateUriToggleText(this.uriToggle, mode);
  }

  setShowDatatypes(show: boolean): void {
    this.config.showDatatypes = show;
    this.updateDatatypeToggleText(this.datatypeToggle, show);
  }

  setEllipsisMode(enabled: boolean): void {
    this.config.ellipsisMode = enabled;
    this.updateEllipsisToggleText(this.ellipsisToggle, enabled);
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
