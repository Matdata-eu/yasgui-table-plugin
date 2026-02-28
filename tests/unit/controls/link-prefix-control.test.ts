/**
 * Tests for LinkPrefixControl
 */

import { LinkPrefixControl } from '../../../src/controls/link-prefix-control';

describe('LinkPrefixControl', () => {
  let onPrefixChange: jest.Mock;

  beforeEach(() => {
    onPrefixChange = jest.fn();
  });

  describe('initial state', () => {
    it('should render a toggle button', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const el = ctrl.getElement();
      const btn = el.querySelector('button');
      expect(btn).not.toBeNull();
    });

    it('should show "Link: Default" when no prefix is set', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const btn = ctrl.getElement().querySelector('button')!;
      expect(btn.textContent).toBe('Link: Default');
      expect(btn.classList.contains('active')).toBe(false);
    });

    it('should show "Link: Custom" and active class when a prefix is set', () => {
      const ctrl = new LinkPrefixControl({
        prefix: 'https://faceted.example.org/?uri=',
        onPrefixChange,
      });
      const btn = ctrl.getElement().querySelector('button')!;
      expect(btn.textContent).toBe('Link: Custom');
      expect(btn.classList.contains('active')).toBe(true);
    });

    it('should hide the panel by default', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const panel = ctrl.getElement().querySelector('.table-link-prefix-panel') as HTMLElement;
      expect(panel.style.display).toBe('none');
    });
  });

  describe('panel toggle', () => {
    it('should show the panel when the toggle button is clicked', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const btn = ctrl.getElement().querySelector('button')!;
      const panel = ctrl.getElement().querySelector('.table-link-prefix-panel') as HTMLElement;

      btn.click();
      expect(panel.style.display).not.toBe('none');
    });

    it('should hide the panel on second click', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const btn = ctrl.getElement().querySelector('button')!;
      const panel = ctrl.getElement().querySelector('.table-link-prefix-panel') as HTMLElement;

      btn.click(); // open
      btn.click(); // close
      expect(panel.style.display).toBe('none');
    });
  });

  describe('applying a prefix', () => {
    it('should call onPrefixChange with the input value when Apply is clicked', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const el = ctrl.getElement();

      // Open panel
      (el.querySelector('button') as HTMLButtonElement).click();

      const input = el.querySelector('.table-link-prefix-input') as HTMLInputElement;
      const applyBtn = el.querySelector('.table-link-prefix-button-apply') as HTMLButtonElement;

      input.value = 'https://faceted.example.org/?uri=';
      applyBtn.click();

      expect(onPrefixChange).toHaveBeenCalledWith('https://faceted.example.org/?uri=');
    });

    it('should trim whitespace from input value', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const el = ctrl.getElement();

      (el.querySelector('button') as HTMLButtonElement).click();
      const input = el.querySelector('.table-link-prefix-input') as HTMLInputElement;
      const applyBtn = el.querySelector('.table-link-prefix-button-apply') as HTMLButtonElement;

      input.value = '  https://faceted.example.org/?uri=  ';
      applyBtn.click();

      expect(onPrefixChange).toHaveBeenCalledWith('https://faceted.example.org/?uri=');
    });

    it('should close the panel after applying', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const el = ctrl.getElement();

      (el.querySelector('button') as HTMLButtonElement).click();
      const input = el.querySelector('.table-link-prefix-input') as HTMLInputElement;
      input.value = 'https://faceted.example.org/?uri=';
      (el.querySelector('.table-link-prefix-button-apply') as HTMLButtonElement).click();

      const panel = el.querySelector('.table-link-prefix-panel') as HTMLElement;
      expect(panel.style.display).toBe('none');
    });

    it('should update toggle button label after applying a prefix', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const el = ctrl.getElement();
      const toggleBtn = el.querySelector('button')!;

      toggleBtn.click();
      const input = el.querySelector('.table-link-prefix-input') as HTMLInputElement;
      input.value = 'https://faceted.example.org/?uri=';
      (el.querySelector('.table-link-prefix-button-apply') as HTMLButtonElement).click();

      expect(toggleBtn.textContent).toBe('Link: Custom');
      expect(toggleBtn.classList.contains('active')).toBe(true);
    });

    it('should apply when Enter is pressed in the input', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const el = ctrl.getElement();

      (el.querySelector('button') as HTMLButtonElement).click();
      const input = el.querySelector('.table-link-prefix-input') as HTMLInputElement;
      input.value = 'https://faceted.example.org/?uri=';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(onPrefixChange).toHaveBeenCalledWith('https://faceted.example.org/?uri=');
    });

    it('should close panel when Escape is pressed in the input', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const el = ctrl.getElement();

      (el.querySelector('button') as HTMLButtonElement).click();
      const input = el.querySelector('.table-link-prefix-input') as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      const panel = el.querySelector('.table-link-prefix-panel') as HTMLElement;
      expect(panel.style.display).toBe('none');
      expect(onPrefixChange).not.toHaveBeenCalled();
    });
  });

  describe('clearing the prefix', () => {
    it('should call onPrefixChange with empty string when Clear is clicked', () => {
      const ctrl = new LinkPrefixControl({
        prefix: 'https://faceted.example.org/?uri=',
        onPrefixChange,
      });
      const el = ctrl.getElement();

      (el.querySelector('button') as HTMLButtonElement).click();
      (el.querySelector('.table-link-prefix-button-clear') as HTMLButtonElement).click();

      expect(onPrefixChange).toHaveBeenCalledWith('');
    });

    it('should revert toggle label to "Link: Default" after clearing', () => {
      const ctrl = new LinkPrefixControl({
        prefix: 'https://faceted.example.org/?uri=',
        onPrefixChange,
      });
      const el = ctrl.getElement();
      const toggleBtn = el.querySelector('button')!;

      toggleBtn.click();
      (el.querySelector('.table-link-prefix-button-clear') as HTMLButtonElement).click();

      expect(toggleBtn.textContent).toBe('Link: Default');
      expect(toggleBtn.classList.contains('active')).toBe(false);
    });
  });

  describe('setPrefix', () => {
    it('should update the input and toggle label without firing onPrefixChange', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      ctrl.setPrefix('https://new.example.org/?uri=');

      const el = ctrl.getElement();
      const toggleBtn = el.querySelector('button')!;
      const input = el.querySelector('.table-link-prefix-input') as HTMLInputElement;

      expect(input.value).toBe('https://new.example.org/?uri=');
      expect(toggleBtn.textContent).toBe('Link: Custom');
      expect(onPrefixChange).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should remove the element from the DOM', () => {
      const ctrl = new LinkPrefixControl({ prefix: '', onPrefixChange });
      const el = ctrl.getElement();
      document.body.appendChild(el);

      ctrl.destroy();

      expect(document.body.contains(el)).toBe(false);
    });
  });
});
