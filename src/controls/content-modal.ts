/**
 * Content Modal Component
 * Displays full cell content in an overlay modal
 */

export class ContentModal {
  private modal: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;

  /**
   * Show the modal with full content
   * @param content Content to display
   * @param title Optional title for the modal
   */
  show(content: string, title?: string): void {
    // Create backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'table-modal-backdrop';
    this.backdrop.addEventListener('click', () => this.close());

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'table-modal';
    this.modal.addEventListener('click', (e) => e.stopPropagation());

    // Create header
    const header = document.createElement('div');
    header.className = 'table-modal-header';

    const titleElement = document.createElement('h3');
    titleElement.className = 'table-modal-title';
    titleElement.textContent = title || 'Cell Content';

    const closeButton = document.createElement('button');
    closeButton.className = 'table-modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close modal');
    closeButton.addEventListener('click', () => this.close());

    header.appendChild(titleElement);
    header.appendChild(closeButton);

    // Create content area
    const contentArea = document.createElement('div');
    contentArea.className = 'table-modal-content';
    contentArea.textContent = content;

    // Create footer
    const footer = document.createElement('div');
    footer.className = 'table-modal-footer';

    const copyButton = document.createElement('button');
    copyButton.className = 'table-modal-button';
    copyButton.textContent = 'Copy to Clipboard';
    copyButton.addEventListener('click', () => this.copyToClipboard(content));

    const closeFooterButton = document.createElement('button');
    closeFooterButton.className = 'table-modal-button table-modal-button-secondary';
    closeFooterButton.textContent = 'Close';
    closeFooterButton.addEventListener('click', () => this.close());

    footer.appendChild(copyButton);
    footer.appendChild(closeFooterButton);

    // Assemble modal
    this.modal.appendChild(header);
    this.modal.appendChild(contentArea);
    this.modal.appendChild(footer);

    // Add to DOM
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    // Add escape key handler
    document.addEventListener('keydown', this.handleEscape);

    // Focus close button
    closeButton.focus();
  }

  /**
   * Close the modal
   */
  close(): void {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    document.removeEventListener('keydown', this.handleEscape);
  }

  /**
   * Handle escape key to close modal
   */
  private handleEscape = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.close();
    }
  };

  /**
   * Copy content to clipboard
   */
  private async copyToClipboard(content: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        // TODO: Show success feedback
        console.log('Content copied to clipboard');
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        console.log('Content copied to clipboard (fallback)');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }
}
