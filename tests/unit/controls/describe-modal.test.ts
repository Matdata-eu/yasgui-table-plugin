/**
 * Tests for the DescribeModal navigation history
 */

import { DescribeModal } from '../../../src/controls/describe-modal';
import { DescribeParseResult } from '../../../src/parsers/describe-parser';
import { ResourceDirection } from '../../../src/parsers/resource-query';

const A = 'http://example.org/a';
const B = 'http://example.org/b';
const C = 'http://example.org/c';

/** One triple linking `uri` to `next`. */
const linkingTo = (uri: string, next: string): DescribeParseResult => ({
  triples: [{ subject: uri, predicate: 'http://example.org/next', object: { type: 'uri', value: next } }],
  raw: '',
});

const NEXT: Record<string, string> = { [A]: B, [B]: C, [C]: 'http://example.org/d' };

describe('DescribeModal navigation history', () => {
  let modal: DescribeModal;
  let onDescribe: jest.Mock;

  /** Mimics TablePlugin.runResourceQuery: show the results of the described URI. */
  const show = (uri: string, direction: ResourceDirection) =>
    modal.showResults(uri, linkingTo(uri, NEXT[uri]), { direction });

  const ctrlClick = (uri: string, shiftKey = false) => {
    const link = Array.from(document.querySelectorAll<HTMLAnchorElement>('.describe-modal-uri'))
      .find((a) => a.getAttribute('href') === uri)!;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true, shiftKey });
    link.dispatchEvent(event);
    return event;
  };

  const navButton = (name: string) => document.querySelector<HTMLButtonElement>(`.describe-modal-${name}`)!;
  const title = () => document.querySelector('.table-modal-title')!.textContent;

  beforeEach(() => {
    onDescribe = jest.fn((uri: string, direction: ResourceDirection) => show(uri, direction));
    modal = new DescribeModal({ onDescribe });
    modal.startHistory(A, 'subject');
    show(A, 'subject');
  });

  afterEach(() => {
    modal.close();
    document.body.innerHTML = '';
  });

  /** a -> b (subject) -> c (object) */
  const hopTwice = () => {
    ctrlClick(B);
    ctrlClick(C, true);
  };

  it('renders URIs in the triples table as links', () => {
    const links = document.querySelectorAll('.describe-modal-uri');
    expect(Array.from(links).map((a) => a.getAttribute('href'))).toEqual([A, 'http://example.org/next', B]);
  });

  it('leaves a plain click on a URI to the browser', () => {
    const link = document.querySelector<HTMLAnchorElement>('.describe-modal-uri')!;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(onDescribe).not.toHaveBeenCalled();
  });

  it('describes a Ctrl+clicked URI, as object with Shift', () => {
    expect(ctrlClick(B).defaultPrevented).toBe(true);
    expect(onDescribe).toHaveBeenLastCalledWith(B, 'subject');
    ctrlClick(C, true);
    expect(onDescribe).toHaveBeenLastCalledWith(C, 'object');
    expect(modal.getHistory()).toEqual([
      { uri: A, direction: 'subject' },
      { uri: B, direction: 'subject' },
      { uri: C, direction: 'object' },
    ]);
  });

  it('disables back and forward on a fresh describe', () => {
    expect(navButton('start').disabled).toBe(true);
    expect(navButton('back').disabled).toBe(true);
    expect(navButton('forward').disabled).toBe(true);
  });

  it('steps back and forward, keeping each direction', () => {
    hopTwice();
    expect(navButton('back').disabled).toBe(false);
    expect(navButton('forward').disabled).toBe(true);

    navButton('back').click();
    expect(onDescribe).toHaveBeenLastCalledWith(B, 'subject');
    expect(navButton('forward').disabled).toBe(false);

    navButton('forward').click();
    expect(onDescribe).toHaveBeenLastCalledWith(C, 'object');
    expect(title()).toContain('as object');
    expect(navButton('forward').disabled).toBe(true);
  });

  it('returns to the original describe', () => {
    hopTwice();
    navButton('start').click();
    expect(onDescribe).toHaveBeenLastCalledWith(A, 'subject');
    expect(navButton('back').disabled).toBe(true);
    expect(navButton('forward').disabled).toBe(false);
  });

  it('drops the forward steps when a URI is Ctrl+clicked after going back', () => {
    hopTwice();
    modal.backToStart();
    ctrlClick(B);
    expect(modal.getHistory().map((e) => e.uri)).toEqual([A, B]);
    expect(navButton('forward').disabled).toBe(true);
  });

  it('supports Alt+Left and Alt+Right', () => {
    hopTwice();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
    expect(onDescribe).toHaveBeenLastCalledWith(B, 'subject');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true }));
    expect(onDescribe).toHaveBeenLastCalledWith(C, 'object');
  });

  it('starts a fresh history for a describe from the results table', () => {
    hopTwice();
    modal.startHistory(B, 'object');
    expect(modal.getHistory()).toEqual([{ uri: B, direction: 'object' }]);
    expect(modal.canGoBack()).toBe(false);
    expect(modal.canGoForward()).toBe(false);
  });
});
