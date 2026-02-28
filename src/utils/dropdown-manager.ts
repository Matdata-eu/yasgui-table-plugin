/**
 * Dropdown Manager
 * Keeps a registry of all open dropdown controls so that opening one
 * automatically closes any other that is currently open, and clicking
 * anywhere outside the toolbar closes them all.
 */

interface Closeable {
  close(): void;
}

const registry: Set<Closeable> = new Set();
let listenerAttached = false;

function attachGlobalListener(): void {
  if (listenerAttached) return;
  listenerAttached = true;
  document.addEventListener('click', () => closeAllDropdowns());
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });
}

export function registerDropdown(instance: Closeable): void {
  registry.add(instance);
  attachGlobalListener();
}

export function closeAllDropdowns(): void {
  registry.forEach((d) => d.close());
}
