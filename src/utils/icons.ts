/**
 * Inline Lucide icons (https://lucide.dev, ISC licence).
 *
 * Only the handful of icons the plugin needs are inlined, so there is no
 * runtime dependency. All icons are stroke icons drawn in `currentColor`.
 */

const PATHS = {
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevrons-left': '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'circle-help':
    '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  'sliders-horizontal':
    '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/>' +
    '<line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/>' +
    '<line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/>' +
    '<line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/>' +
    '<line x1="16" x2="16" y1="18" y2="22"/>',
  table:
    '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  'triangle-alert':
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  link:
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
    '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
} as const;

export type IconName = keyof typeof PATHS;

/**
 * SVG markup for a Lucide icon.
 * @param name Icon name
 * @param size Width and height in px (default 16)
 * @param className Optional extra class for the `<svg>` element
 */
export function icon(name: IconName, size = 16, className = ''): string {
  const cls = `table-icon table-icon-${name}${className ? ' ' + className : ''}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" width="${size}" height="${size}" ` +
    'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    `stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`
  );
}

/** A Lucide icon as a DOM element. */
export function iconElement(name: IconName, size = 16, className = ''): SVGElement {
  const wrapper = document.createElement('span');
  wrapper.innerHTML = icon(name, size, className);
  return wrapper.firstElementChild as SVGElement;
}
