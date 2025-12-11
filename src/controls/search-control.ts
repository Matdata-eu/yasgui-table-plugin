import { debounce } from '../utils/debounce.js';

export interface SearchControlConfig {
  placeholder?: string;
  debounceMs?: number;
  onSearch: (searchTerm: string) => void;
}

/**
 * Search control component with debounced input
 * Provides search input field with row count indicator
 */
export class SearchControl {
  private container: HTMLElement;
  private input: HTMLInputElement;
  private rowCountDisplay: HTMLElement;
  private config: Required<SearchControlConfig>;
  private debouncedSearch: (term: string) => void;

  constructor(config: SearchControlConfig) {
    this.config = {
      placeholder: config.placeholder || 'Search in table...',
      debounceMs: config.debounceMs || 300,
      onSearch: config.onSearch,
    };

    this.container = this.createContainer();
    this.input = this.createSearchInput();
    this.rowCountDisplay = this.createRowCountDisplay();
    
    // Create debounced search handler
    this.debouncedSearch = debounce((term: string) => {
      this.config.onSearch(term);
    }, this.config.debounceMs);

    // Build DOM structure
    this.container.appendChild(this.input);
    this.container.appendChild(this.rowCountDisplay);
    
    this.attachEventListeners();
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'table-search-control';
    return container;
  }

  private createSearchInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'table-search-input';
    input.placeholder = this.config.placeholder;
    input.setAttribute('aria-label', 'Search table');
    return input;
  }

  private createRowCountDisplay(): HTMLElement {
    const display = document.createElement('span');
    display.className = 'table-row-count';
    display.setAttribute('aria-live', 'polite');
    return display;
  }

  private attachEventListeners(): void {
    this.input.addEventListener('input', () => {
      const searchTerm = this.input.value;
      this.debouncedSearch(searchTerm);
    });
  }

  /**
   * Update the row count display
   * @param filteredCount Number of visible rows after filter
   * @param totalCount Total number of rows
   */
  updateRowCount(filteredCount: number, totalCount: number): void {
    if (this.input.value === '') {
      this.rowCountDisplay.textContent = `${totalCount} rows`;
    } else {
      this.rowCountDisplay.textContent = `${filteredCount} of ${totalCount} rows`;
    }
  }

  /**
   * Get the current search term
   */
  getSearchTerm(): string {
    return this.input.value;
  }

  /**
   * Set the search term programmatically
   * @param term Search term to set
   * @param triggerSearch Whether to trigger the search callback
   */
  setSearchTerm(term: string, triggerSearch = false): void {
    this.input.value = term;
    if (triggerSearch) {
      this.config.onSearch(term);
    }
  }

  /**
   * Clear the search input
   */
  clear(): void {
    this.input.value = '';
    this.config.onSearch('');
    this.rowCountDisplay.textContent = '';
  }

  /**
   * Get the DOM element for rendering
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Focus the search input
   */
  focus(): void {
    this.input.focus();
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    // Remove event listeners (input listener will be garbage collected with input element)
    this.container.remove();
  }
}
