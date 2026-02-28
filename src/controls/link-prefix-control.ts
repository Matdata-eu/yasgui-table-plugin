/**
 * Link Prefix Control Component
 * Lets users configure a URL prefix that wraps every URI link in the table,
 * e.g. to redirect clicks to a faceted browser instead of the raw URI.
 */

export interface LinkPrefixControlConfig {
  /** Current prefix value (empty string means no prefix). */
  prefix: string;
  /** Called whenever the user applies or clears the prefix. */
  onPrefixChange: (prefix: string) => void;
}

/**
 * Toolbar control that exposes an inline input for a user-configurable URI
 * link prefix.  When a prefix is set every URI in the table is opened as
 * `<prefix><uri>` instead of the raw URI.
 */
export class LinkPrefixControl {
  private container: HTMLElement;
  private toggleButton: HTMLButtonElement;
  private panelEl: HTMLElement;
  private inputEl: HTMLInputElement;
  private applyButton: HTMLButtonElement;
  private clearButton: HTMLButtonElement;
  private config: LinkPrefixControlConfig;
  private panelVisible: boolean = false;

  constructor(config: LinkPrefixControlConfig) {
    this.config = { ...config };
    this.container = this.createContainer();
    this.toggleButton = this.createToggleButton();
    this.inputEl = this.createInput();
    this.applyButton = this.createApplyButton();
    this.clearButton = this.createClearButton();
    this.panelEl = this.createPanel();

    this.container.appendChild(this.toggleButton);
    this.container.appendChild(this.panelEl);

    this.updateToggleLabel();
  }

  // ---- DOM builders -------------------------------------------------------

  private createContainer(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'table-link-prefix-control';
    return el;
  }

  private createToggleButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'table-toggle-button';
    btn.setAttribute('aria-label', 'Configure URI link prefix');
    btn.addEventListener('click', () => this.togglePanel());
    return btn;
  }

  private createInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'table-link-prefix-input';
    input.placeholder = 'https://example.org/browse?uri=';
    input.setAttribute('aria-label', 'URI link prefix URL');
    input.value = this.config.prefix;
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        this.applyPrefix();
      } else if (e.key === 'Escape') {
        this.closePanel();
      }
    });
    return input;
  }

  private createApplyButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'table-link-prefix-button table-link-prefix-button-apply';
    btn.textContent = 'Apply';
    btn.setAttribute('aria-label', 'Apply URI link prefix');
    btn.addEventListener('click', () => this.applyPrefix());
    return btn;
  }

  private createClearButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'table-link-prefix-button table-link-prefix-button-clear';
    btn.textContent = 'Clear';
    btn.setAttribute('aria-label', 'Clear URI link prefix');
    btn.addEventListener('click', () => this.clearPrefix());
    return btn;
  }

  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'table-link-prefix-panel';
    panel.setAttribute('aria-label', 'URI link prefix configuration');
    panel.style.display = 'none';

    const label = document.createElement('span');
    label.className = 'table-link-prefix-panel-label';
    label.textContent = 'Link prefix:';

    panel.appendChild(label);
    panel.appendChild(this.inputEl);
    panel.appendChild(this.applyButton);
    panel.appendChild(this.clearButton);
    return panel;
  }

  // ---- Actions ------------------------------------------------------------

  private togglePanel(): void {
    this.panelVisible = !this.panelVisible;
    this.panelEl.style.display = this.panelVisible ? 'flex' : 'none';
    if (this.panelVisible) {
      // Sync input with current prefix value
      this.inputEl.value = this.config.prefix;
      this.inputEl.focus();
    }
  }

  private closePanel(): void {
    this.panelVisible = false;
    this.panelEl.style.display = 'none';
  }

  private applyPrefix(): void {
    const newPrefix = this.inputEl.value.trim();
    this.config.prefix = newPrefix;
    this.config.onPrefixChange(newPrefix);
    this.updateToggleLabel();
    this.closePanel();
  }

  private clearPrefix(): void {
    this.inputEl.value = '';
    this.config.prefix = '';
    this.config.onPrefixChange('');
    this.updateToggleLabel();
    this.closePanel();
  }

  private updateToggleLabel(): void {
    this.toggleButton.textContent = this.config.prefix
      ? 'Link: Custom'
      : 'Link: Default';
    if (this.config.prefix) {
      this.toggleButton.classList.add('active');
    } else {
      this.toggleButton.classList.remove('active');
    }
    this.toggleButton.title = this.config.prefix
      ? `URI prefix: ${this.config.prefix}`
      : 'Set a custom URL prefix for URI links';
  }

  // ---- Public API ---------------------------------------------------------

  /**
   * Update the prefix value programmatically (without triggering onPrefixChange).
   */
  setPrefix(prefix: string): void {
    this.config.prefix = prefix;
    this.inputEl.value = prefix;
    this.updateToggleLabel();
  }

  /**
   * Get the DOM element for rendering.
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Clean up.
   */
  destroy(): void {
    this.container.remove();
  }
}
