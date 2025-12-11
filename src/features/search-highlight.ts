/**
 * Search highlighting utilities
 * Wraps matching text in <mark> tags for visual highlighting
 */

/**
 * Escape special regex characters in search term
 * @param term Search term to escape
 * @returns Escaped term safe for regex
 */
function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight search term in text content
 * Wraps matches in <mark class="table-search-highlight"> tags
 * 
 * @param text Text to search and highlight
 * @param searchTerm Term to highlight (case-insensitive)
 * @returns HTML string with highlighted matches
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm || searchTerm.trim() === '') {
    return text;
  }

  try {
    const escapedTerm = escapeRegExp(searchTerm.trim());
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return text.replace(regex, '<mark class="table-search-highlight">$1</mark>');
  } catch (error) {
    // If regex construction fails, return original text
    console.warn('Failed to create search highlight regex:', error);
    return text;
  }
}

/**
 * Remove all search highlighting from HTML content
 * @param html HTML string with potential <mark> tags
 * @returns Text without highlighting tags
 */
export function removeHighlighting(html: string): string {
  return html.replace(/<mark class="table-search-highlight">(.*?)<\/mark>/gi, '$1');
}

/**
 * Check if text contains search term (case-insensitive)
 * @param text Text to search
 * @param searchTerm Term to find
 * @returns True if text contains term
 */
export function containsSearchTerm(text: string, searchTerm: string): boolean {
  if (!searchTerm || searchTerm.trim() === '') {
    return true;
  }

  return text.toLowerCase().includes(searchTerm.toLowerCase().trim());
}
