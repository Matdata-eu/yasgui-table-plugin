/**
 * Feature detection for the yasr host API (MatGUI).
 *
 * Newer MatGUI versions expose `yasr.hostApi` together with a shared describe
 * panel (`yasr.describe`) and a toolbar slot for plugins
 * (`yasr.getPluginToolbar`). Older versions have neither, so every caller
 * must check here first and fall back to the plugin's own modal and toolbar.
 * Detection is by feature, never by version string.
 */

import type { HostDescribeDirection, Yasr } from '../types/config.js';
import type { ResourceDirection } from '../parsers/resource-query.js';

/** True when yasr offers the shared describe panel. */
export function hasHostDescribe(yasr: Yasr | null | undefined): boolean {
  return !!(yasr && yasr.hostApi && yasr.hostApi.describe && typeof yasr.describe === 'function');
}

/**
 * The yasr plugin toolbar slot, or `null` when yasr does not offer one (or it
 * could not be obtained).
 */
export function getHostToolbar(yasr: Yasr | null | undefined): HTMLDivElement | null {
  if (!yasr || !yasr.hostApi || !yasr.hostApi.toolbar || typeof yasr.getPluginToolbar !== 'function') {
    return null;
  }
  try {
    const bar = yasr.getPluginToolbar();
    return bar && typeof (bar as HTMLElement).appendChild === 'function' ? bar : null;
  } catch (error) {
    console.warn('yasgui-table-plugin: could not get the yasr plugin toolbar, using the own toolbar', error);
    return null;
  }
}

/** Map the plugin's subject/object direction to the host's outgoing/incoming. */
export function toHostDirection(direction: ResourceDirection): HostDescribeDirection {
  return direction === 'object' ? 'incoming' : 'outgoing';
}
