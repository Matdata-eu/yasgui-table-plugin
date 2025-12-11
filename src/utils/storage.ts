/**
 * LocalStorage Wrapper
 * Handles persistence of display configuration with fallbacks
 */

import { DisplayConfiguration } from '../types/config';

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Save display configuration to localStorage
 */
export function saveDisplayConfig(key: string, config: DisplayConfiguration): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, configuration will not persist');
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save display configuration:', error);
  }
}

/**
 * Load display configuration from localStorage
 */
export function loadDisplayConfig(key: string): DisplayConfiguration | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as DisplayConfiguration;
    }
  } catch (error) {
    console.error('Failed to load display configuration:', error);
  }

  return null;
}

/**
 * Clear display configuration from localStorage
 */
export function clearDisplayConfig(key: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear display configuration:', error);
  }
}
