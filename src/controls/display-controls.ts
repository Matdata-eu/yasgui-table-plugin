/**
 * Display Controls Component
 * Toggle buttons for URI display mode, datatype visibility, and ellipsis mode –
 * collapsed behind a "Display" dropdown trigger button.
 */

import { closeAllDropdowns, registerDropdown } from '../utils/dropdown-manager.js';
import { icon } from '../utils/icons.js';

export interface DisplayControlsConfig {
  uriDisplayMode: 'full' | 'abbreviated';
  showDatatypes: boolean;
  ellipsisMode: boolean;
  smartFormatters: boolean;
  decimalPlaces?: number;
  onUriDisplayChange: (mode: 'full' | 'abbreviated') => void;
  onShowDatatypesChange: (show: boolean) => void;
  onEllipsisModeChange: (enabled: boolean) => void;
  onSmartFormattersChange: (enabled: boolean) => void;
  onDecimalPlacesChange: (places: number | undefined) => void;
  /**
   * Render as the "View settings" button of the yasr plugin toolbar slot (`.yasr_toolbarButton`)
   * instead of the plugin's own toolbar.
   */
  hostToolbar?: boolean;
}

export class DisplayControls {
  private container: HTMLElement;
  private triggerButton: HTMLButtonElement;
  private panel: HTMLElement;
  private uriToggle: HTMLButtonElement;
  private datatypeToggle: HTMLButtonElement;
  private ellipsisToggle: HTMLButtonElement;
  private smartFormattersToggle: HTMLButtonElement;
  private decimalPlacesRow: HTMLElement;
  private decimalPlacesInput: HTMLInputElement;
  private config: DisplayControlsConfig;
  private isOpen = false;

  constructor(config: DisplayControlsConfig) {
    this.config = config;
    this.container = this.createContainer();
    this.uriToggle = this.createUriToggle();
    this.datatypeToggle = this.createDatatypeToggle();
    this.ellipsisToggle = this.createEllipsisToggle();
    this.smartFormattersToggle = this.createSmartFormattersToggle();
    this.decimalPlacesInput = this.createDecimalPlacesInput();
    this.decimalPlacesRow = this.createDecimalPlacesRow();

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
    button.className = this.config.hostToolbar
      ? 'yasr_toolbarButton table-dropdown-trigger'
      : 'table-toggle-button table-dropdown-trigger';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('title', this.config.hostToolbar ? 'View settings' : 'Display options');
    button.innerHTML = this.config.hostToolbar
      ? `${icon('sliders-horizontal')}<span>View settings</span>`
      : `<span>Display</span>${icon('chevron-down', 12, 'table-dropdown-caret')}`;
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    return button;
  }

  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    // View settings sit at the far right of the host toolbar: open towards the left
    panel.className = this.config.hostToolbar
      ? 'table-dropdown-panel table-dropdown-panel-end'
      : 'table-dropdown-panel';
    panel.setAttribute('role', 'menu');
    panel.appendChild(this.uriToggle);
    panel.appendChild(this.datatypeToggle);
    panel.appendChild(this.ellipsisToggle);
    panel.appendChild(this.smartFormattersToggle);
    panel.appendChild(this.decimalPlacesRow);
    return panel;
  }

  private createDecimalPlacesInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'table-decimal-places-input';
    input.min = '0';
    input.max = '15';
    input.step = '1';
    input.placeholder = 'Raw';
    input.setAttribute('aria-label', 'Number of fraction digits for decimal values');
    input.value = this.config.decimalPlaces !== undefined ? String(this.config.decimalPlaces) : '';
    input.addEventListener('change', () => this.applyDecimalPlaces());
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        this.applyDecimalPlaces();
      }
      e.stopPropagation();
    });
    return input;
  }

  private createDecimalPlacesRow(): HTMLElement {
    const row = document.createElement('div');
    row.className = 'table-dropdown-item table-decimal-places-control';
    row.setAttribute('title', 'Fixed number of fraction digits for xsd:float, xsd:double and xsd:decimal values (empty = raw)');
    // Keep the dropdown open while interacting with the input
    row.addEventListener('click', (e) => e.stopPropagation());

    const label = document.createElement('span');
    label.className = 'table-decimal-places-label';
    label.textContent = 'Decimals';

    row.appendChild(label);
    row.appendChild(this.decimalPlacesInput);
    return row;
  }

  private applyDecimalPlaces(): void {
    const raw = this.decimalPlacesInput.value.trim();
    let places: number | undefined;
    if (raw !== '') {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        places = Math.min(15, Math.max(0, Math.round(parsed)));
      }
    }
    this.config.decimalPlaces = places;
    // Reflect clamped/cleared value back in the input
    this.decimalPlacesInput.value = places !== undefined ? String(places) : '';
    this.config.onDecimalPlacesChange(places);
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

  private createSmartFormattersToggle(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-toggle-button table-dropdown-item';
    button.setAttribute('aria-label', 'Toggle smart formatters');
    button.setAttribute('title', 'Apply formatters by XSD datatype and variable name convention');
    this.updateSmartFormattersToggleText(button, this.config.smartFormatters);
    button.addEventListener('click', () => {
      const newEnabled = !this.config.smartFormatters;
      this.config.smartFormatters = newEnabled;
      this.updateSmartFormattersToggleText(button, newEnabled);
      this.config.onSmartFormattersChange(newEnabled);
    });
    return button;
  }

  private updateUriToggleText(button: HTMLButtonElement, mode: 'full' | 'abbreviated'): void {
    button.textContent = mode === 'full' ? 'URI: full' : 'URI: short';
    button.classList.toggle('active', mode === 'abbreviated');
  }

  private updateDatatypeToggleText(button: HTMLButtonElement, show: boolean): void {
    button.textContent = show ? 'Types: on' : 'Types: off';
    button.classList.toggle('active', !show);
  }

  private updateEllipsisToggleText(button: HTMLButtonElement, enabled: boolean): void {
    button.textContent = enabled ? 'Ellipsis: on' : 'Ellipsis: off';
    button.classList.toggle('active', enabled);
  }

  private updateSmartFormattersToggleText(button: HTMLButtonElement, enabled: boolean): void {
    button.textContent = enabled ? 'Smart formatters: on' : 'Smart formatters: off';
    if (enabled) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
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

  /**
   * Update the smart formatters setting programmatically
   */
  setSmartFormatters(enabled: boolean): void {
    this.config.smartFormatters = enabled;
    this.updateSmartFormattersToggleText(this.smartFormattersToggle, enabled);
  }

  /**
   * Update the decimal places setting programmatically (undefined = raw)
   */
  setDecimalPlaces(places: number | undefined): void {
    this.config.decimalPlaces = places;
    this.decimalPlacesInput.value = places !== undefined ? String(places) : '';
  }

  /**
   * Get the DOM element for rendering
   */
  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
