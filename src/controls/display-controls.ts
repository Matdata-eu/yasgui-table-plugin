/**
 * Display Controls Component
 * Provides toggle buttons for URI display mode and datatype visibility
 */

export interface DisplayControlsConfig {
  uriDisplayMode: 'full' | 'abbreviated';
  showDatatypes: boolean;
  onUriDisplayChange: (mode: 'full' | 'abbreviated') => void;
  onShowDatatypesChange: (show: boolean) => void;
}

/**
 * Display controls for URI and datatype toggles
 */
export class DisplayControls {
  private container: HTMLElement;
  private uriToggle: HTMLButtonElement;
  private datatypeToggle: HTMLButtonElement;
  private config: DisplayControlsConfig;

  constructor(config: DisplayControlsConfig) {
    this.config = config;
    this.container = this.createContainer();
    this.uriToggle = this.createUriToggle();
    this.datatypeToggle = this.createDatatypeToggle();

    // Build DOM structure
    this.container.appendChild(this.createLabel('Display:'));
    this.container.appendChild(this.uriToggle);
    this.container.appendChild(this.datatypeToggle);

    this.attachEventListeners();
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'table-display-controls';
    return container;
  }

  private createLabel(text: string): HTMLElement {
    const label = document.createElement('span');
    label.className = 'table-control-label';
    label.textContent = text;
    return label;
  }

  private createUriToggle(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-toggle-button';
    button.setAttribute('aria-label', 'Toggle URI display mode');
    button.setAttribute('title', 'Toggle between full and abbreviated URIs');
    this.updateUriToggleText(button, this.config.uriDisplayMode);
    return button;
  }

  private createDatatypeToggle(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-toggle-button';
    button.setAttribute('aria-label', 'Toggle datatype display');
    button.setAttribute('title', 'Show or hide datatype annotations');
    this.updateDatatypeToggleText(button, this.config.showDatatypes);
    return button;
  }

  private updateUriToggleText(button: HTMLButtonElement, mode: 'full' | 'abbreviated'): void {
    button.textContent = mode === 'full' ? 'URI: Full' : 'URI: Short';
    if (mode === 'abbreviated') {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  }

  private updateDatatypeToggleText(button: HTMLButtonElement, show: boolean): void {
    button.textContent = show ? 'Types: On' : 'Types: Off';
    if (show) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  }

  private attachEventListeners(): void {
    this.uriToggle.addEventListener('click', () => {
      const newMode = this.config.uriDisplayMode === 'full' ? 'abbreviated' : 'full';
      this.config.uriDisplayMode = newMode;
      this.updateUriToggleText(this.uriToggle, newMode);
      this.config.onUriDisplayChange(newMode);
    });

    this.datatypeToggle.addEventListener('click', () => {
      const newShow = !this.config.showDatatypes;
      this.config.showDatatypes = newShow;
      this.updateDatatypeToggleText(this.datatypeToggle, newShow);
      this.config.onShowDatatypesChange(newShow);
    });
  }

  /**
   * Update the display mode programmatically
   */
  setUriDisplayMode(mode: 'full' | 'abbreviated'): void {
    this.config.uriDisplayMode = mode;
    this.updateUriToggleText(this.uriToggle, mode);
  }

  /**
   * Update the datatype visibility programmatically
   */
  setShowDatatypes(show: boolean): void {
    this.config.showDatatypes = show;
    this.updateDatatypeToggleText(this.datatypeToggle, show);
  }

  /**
   * Get the DOM element for rendering
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.container.remove();
  }
}
