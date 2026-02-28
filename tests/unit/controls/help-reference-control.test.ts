/**
 * Tests for HelpReferenceControl
 */

import { HelpReferenceControl } from '../../../src/controls/help-reference-control';

describe('HelpReferenceControl', () => {
  let ctrl: HelpReferenceControl;

  beforeEach(() => {
    ctrl = new HelpReferenceControl();
  });

  afterEach(() => {
    ctrl.destroy();
    // Clean up any modals left in body
    document.querySelectorAll('.table-modal-backdrop, .table-modal').forEach((el) => el.remove());
  });

  describe('initial render', () => {
    it('should render a container element', () => {
      expect(ctrl.getElement()).toBeInstanceOf(HTMLElement);
    });

    it('should have the correct container class', () => {
      expect(ctrl.getElement().classList.contains('table-help-reference-control')).toBe(true);
    });

    it('should render a help button inside the container', () => {
      const btn = ctrl.getElement().querySelector('button');
      expect(btn).not.toBeNull();
    });

    it('should apply the table-help-button class to the button', () => {
      const btn = ctrl.getElement().querySelector('button')!;
      expect(btn.classList.contains('table-help-button')).toBe(true);
    });

    it('should set an accessible aria-label on the button', () => {
      const btn = ctrl.getElement().querySelector('button')!;
      expect(btn.getAttribute('aria-label')).toBe('Open quick reference card');
    });

    it('should embed an SVG icon in the button', () => {
      const btn = ctrl.getElement().querySelector('button')!;
      expect(btn.querySelector('svg')).not.toBeNull();
    });
  });

  describe('opening the modal', () => {
    it('should add a backdrop and modal to the document body when the button is clicked', () => {
      const btn = ctrl.getElement().querySelector('button') as HTMLButtonElement;
      btn.click();

      expect(document.querySelector('.table-modal-backdrop')).not.toBeNull();
      expect(document.querySelector('.table-modal')).not.toBeNull();
    });

    it('should show the modal with title "Quick Reference"', () => {
      const btn = ctrl.getElement().querySelector('button') as HTMLButtonElement;
      btn.click();

      const title = document.querySelector('.table-modal-title');
      expect(title?.textContent).toBe('Quick Reference');
    });

    it('should render help sections inside the modal', () => {
      const btn = ctrl.getElement().querySelector('button') as HTMLButtonElement;
      btn.click();

      const sections = document.querySelectorAll('.table-help-section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should include a section about double-clicking cells', () => {
      const btn = ctrl.getElement().querySelector('button') as HTMLButtonElement;
      btn.click();

      const titles = Array.from(document.querySelectorAll('.table-help-section-title')).map(
        (el) => el.textContent
      );
      expect(titles.some((t) => t?.toLowerCase().includes('double-click'))).toBe(true);
    });

    it('should not open a second modal when the button is clicked again', () => {
      const btn = ctrl.getElement().querySelector('button') as HTMLButtonElement;
      btn.click();
      btn.click();

      expect(document.querySelectorAll('.table-modal').length).toBe(1);
    });
  });

  describe('closing the modal', () => {
    beforeEach(() => {
      const btn = ctrl.getElement().querySelector('button') as HTMLButtonElement;
      btn.click();
    });

    it('should remove the modal when the close (×) button is clicked', () => {
      const closeBtn = document.querySelector('.table-modal-close') as HTMLButtonElement;
      closeBtn.click();

      expect(document.querySelector('.table-modal')).toBeNull();
      expect(document.querySelector('.table-modal-backdrop')).toBeNull();
    });

    it('should remove the modal when the footer Close button is clicked', () => {
      const footerCloseBtn = document.querySelector(
        '.table-modal-button-secondary'
      ) as HTMLButtonElement;
      footerCloseBtn.click();

      expect(document.querySelector('.table-modal')).toBeNull();
    });

    it('should remove the modal when the backdrop is clicked', () => {
      const backdrop = document.querySelector('.table-modal-backdrop') as HTMLElement;
      backdrop.click();

      expect(document.querySelector('.table-modal')).toBeNull();
    });

    it('should remove the modal when Escape key is pressed', () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(document.querySelector('.table-modal')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('should remove the element from the DOM', () => {
      const el = ctrl.getElement();
      document.body.appendChild(el);

      ctrl.destroy();

      expect(document.body.contains(el)).toBe(false);
    });

    it('should also close any open modal when destroy is called', () => {
      document.body.appendChild(ctrl.getElement());
      const btn = ctrl.getElement().querySelector('button') as HTMLButtonElement;
      btn.click();

      ctrl.destroy();

      expect(document.querySelector('.table-modal')).toBeNull();
    });
  });
});
