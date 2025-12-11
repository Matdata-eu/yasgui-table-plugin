/**
 * Fit Controls Component
 * Provides buttons to control column sizing behavior
 */

export interface FitControlsConfig {
  onFitToData: () => void;
  onFitToWindow: () => void;
}

/**
 * Controls for adjusting table column fitting behavior
 */
export class FitControls {
  private container: HTMLElement;
  private config: FitControlsConfig;

  constructor(config: FitControlsConfig) {
    this.config = config;
    this.container = this.createContainer();

    // Build DOM structure
    this.container.appendChild(this.createLabel('Fit:'));
    this.container.appendChild(this.createFitToDataButton());
    this.container.appendChild(this.createFitToWindowButton());
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'table-fit-controls';
    return container;
  }

  private createLabel(text: string): HTMLElement {
    const label = document.createElement('span');
    label.className = 'table-control-label';
    label.textContent = text;
    return label;
  }

  private createFitToDataButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-fit-button';
    button.textContent = 'Data';
    button.setAttribute('aria-label', 'Fit columns to data');
    button.setAttribute('title', 'Adjust column widths to fit content');
    button.addEventListener('click', () => this.config.onFitToData());
    return button;
  }

  private createFitToWindowButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'table-fit-button';
    button.textContent = 'Window';
    button.setAttribute('aria-label', 'Fit columns to window');
    button.setAttribute('title', 'Stretch columns to fill available space');
    button.addEventListener('click', () => this.config.onFitToWindow());
    return button;
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
