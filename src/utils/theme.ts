/**
 * Theme Utilities
 * Bridge between YASGUI themes and table styles using CSS variables
 */

/**
 * Apply theme integration by reading YASGUI CSS variables
 * and mapping them to table-specific variables
 */
export function applyThemeIntegration(container: HTMLElement): void {
  const computedStyle = getComputedStyle(document.documentElement);

  // Read YASGUI theme variables (if available)
  const yasguiBackground = computedStyle.getPropertyValue('--yasgui-background');
  const yasguiText = computedStyle.getPropertyValue('--yasgui-text');
  const yasguiBorder = computedStyle.getPropertyValue('--yasgui-border');
  const yasguiPrimary = computedStyle.getPropertyValue('--yasgui-primary');

  // Apply to table container
  if (yasguiBackground) {
    container.style.setProperty('--table-background', yasguiBackground.trim());
  }
  if (yasguiText) {
    container.style.setProperty('--table-text', yasguiText.trim());
  }
  if (yasguiBorder) {
    container.style.setProperty('--table-border', yasguiBorder.trim());
  }
  if (yasguiPrimary) {
    container.style.setProperty('--table-primary', yasguiPrimary.trim());
  }
}

/**
 * Apply custom theme by setting CSS variables
 */
export function applyCustomTheme(container: HTMLElement, themeName: string): void {
  container.setAttribute('data-theme', themeName);
}

/**
 * Detect current YASGUI theme (light/dark)
 */
export function getCurrentTheme() : 'light' | 'dark' {
  return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
}


/**
 * Watch for theme changes and update container
 */
export function watchThemeChanges(
  container: HTMLElement,
  callback?: (theme: 'light' | 'dark') => void
): () => void {
  let lastTheme = getCurrentTheme();
  
  // Create a MutationObserver to watch for style changes
  const observer = new MutationObserver(() => {
    const currentTheme = getCurrentTheme();
    container.setAttribute('data-theme', currentTheme);
    callback?.(currentTheme);
  });

  // Watch for changes to style attributes and class changes on document
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'class', 'data-theme'],
    subtree: false,
  });

  // Also watch for CSS variable changes using a polling fallback
  const intervalId = setInterval(() => {
    const currentTheme = getCurrentTheme();
    if (currentTheme !== lastTheme) {
      lastTheme = currentTheme;
      container.setAttribute('data-theme', currentTheme);
      callback?.(currentTheme);
    }
  }, 500);

  // Return cleanup function
  return () => {
    observer.disconnect();
    clearInterval(intervalId);
  };
}
