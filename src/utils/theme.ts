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
export function detectTheme(): 'light' | 'dark' {
  const computedStyle = getComputedStyle(document.documentElement);
  const background = computedStyle.getPropertyValue('--yasgui-background');

  // Heuristic: if background is dark, assume dark theme
  if (background) {
    const rgb = background.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / 3;
      return brightness < 128 ? 'dark' : 'light';
    }
  }

  // Fallback to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
