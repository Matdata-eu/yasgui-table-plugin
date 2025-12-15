/**
 * Clipboard utilities
 * Handles copying table data to clipboard in various formats
 */

export class ClipboardManager {
  /**
   * Copy text to clipboard
   * Uses modern Clipboard API with execCommand fallback
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Ensure document has focus before attempting clipboard write
        if (document.hasFocus()) {
          await navigator.clipboard.writeText(text);
          return true;
        } else {
          // If document doesn't have focus, try to gain focus first
          window.focus();
          await new Promise(resolve => setTimeout(resolve, 10)); // Brief delay to allow focus
          
          if (document.hasFocus()) {
            await navigator.clipboard.writeText(text);
            return true;
          } else {
            // Still no focus, use fallback
            return this.fallbackCopyToClipboard(text);
          }
        }
      } else {
        // Fallback for older browsers
        return this.fallbackCopyToClipboard(text);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Always try fallback on any error
      return this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * Fallback copy method using execCommand
   */
  private fallbackCopyToClipboard(text: string): boolean {
    let textarea: HTMLTextAreaElement | null = null;
    try {
      textarea = document.createElement('textarea');
      textarea.value = text;
      
      // Style to make invisible but still selectable
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.setAttribute('readonly', '');
      textarea.setAttribute('aria-hidden', 'true');
      textarea.setAttribute('tabindex', '-1');
      
      document.body.appendChild(textarea);
      
      // Focus and select the text
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      
      // Try to copy
      const success = document.execCommand('copy');
      
      if (!success) {
        console.warn('execCommand("copy") returned false');
      }
      
      return success;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    } finally {
      // Always clean up
      if (textarea && textarea.parentNode) {
        document.body.removeChild(textarea);
      }
    }
  }

  /**
   * Format data as Markdown table
   */
  formatAsMarkdown(data: string[][], headers?: string[]): string {
    if (data.length === 0) {
      return '';
    }

    const rows: string[] = [];

    // Add headers if provided
    if (headers && headers.length > 0) {
      rows.push(`| ${headers.join(' | ')} |`);
      rows.push(`| ${headers.map(() => '---').join(' | ')} |`);
    }

    // Add data rows
    for (const row of data) {
      rows.push(`| ${row.join(' | ')} |`);
    }

    return rows.join('\n');
  }

  /**
   * Format data as CSV
   */
  formatAsCSV(data: string[][], headers?: string[]): string {
    const rows: string[] = [];

    // Add headers if provided
    if (headers && headers.length > 0) {
      rows.push(this.csvRow(headers));
    }

    // Add data rows
    for (const row of data) {
      rows.push(this.csvRow(row));
    }

    return rows.join('\n');
  }

  /**
   * Format a single CSV row
   * Handles quoting and escaping
   */
  private csvRow(values: string[]): string {
    return values
      .map((value) => {
        // Quote if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          // Escape quotes by doubling them
          const escaped = value.replace(/"/g, '""');
          return `"${escaped}"`;
        }
        return value;
      })
      .join(',');
  }

  /**
   * Format data as TSV (tab-separated values)
   */
  formatAsTSV(data: string[][], headers?: string[]): string {
    const rows: string[] = [];

    // Add headers if provided
    if (headers && headers.length > 0) {
      rows.push(headers.join('\t'));
    }

    // Add data rows
    for (const row of data) {
      rows.push(row.join('\t'));
    }

    return rows.join('\n');
  }

  /**
   * Download text as file
   */
  downloadAsFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
