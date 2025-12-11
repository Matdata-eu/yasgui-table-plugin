/**
 * Ellipsis Formatter
 * Truncates long content with ellipsis when ellipsisMode is enabled
 */

export interface EllipsisOptions {
  enabled: boolean;
  maxLength?: number; // Default: 150 characters
}

const DEFAULT_MAX_LENGTH = 150;

/**
 * Ellipsis formatter for truncating long cell content
 */
export class EllipsisFormatter {
  private enabled: boolean;
  private maxLength: number;

  constructor(enabled: boolean = false, maxLength: number = DEFAULT_MAX_LENGTH) {
    this.enabled = enabled;
    this.maxLength = maxLength;
  }

  /**
   * Apply ellipsis formatting to content
   * @param content Original content
   * @returns Formatted content (truncated if ellipsisMode enabled)
   */
  format(content: string): { display: string; isTruncated: boolean } {
    if (!this.enabled || content.length <= this.maxLength) {
      return { display: content, isTruncated: false };
    }

    const truncated = content.substring(0, this.maxLength) + '...';
    return { display: truncated, isTruncated: true };
  }

  /**
   * Enable or disable ellipsis mode
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Set maximum length before truncation
   */
  setMaxLength(length: number): void {
    this.maxLength = Math.max(1, length);
  }

  /**
   * Get current ellipsis mode state
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current max length
   */
  getMaxLength(): number {
    return this.maxLength;
  }
}
