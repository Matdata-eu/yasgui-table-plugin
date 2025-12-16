/**
 * Tests for debounce utility
 */

import { debounce } from '../../../src/utils/debounce';

describe('debounce', () => {
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should delay function execution', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous calls', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    jest.advanceTimersByTime(100);
    
    debouncedFn();
    jest.advanceTimersByTime(100);
    
    debouncedFn();
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments correctly', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('test', 123, { key: 'value' });
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith('test', 123, { key: 'value' });
  });

  it('should preserve this context', () => {
    const obj = {
      value: 42,
      fn: jest.fn(function(this: any) {
        return this.value;
      })
    };

    const debouncedFn = debounce(obj.fn, 300);
    debouncedFn.call(obj);
    
    jest.advanceTimersByTime(300);

    expect(obj.fn).toHaveBeenCalled();
  });

  it('should handle multiple debounced functions independently', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const debouncedFn1 = debounce(fn1, 300);
    const debouncedFn2 = debounce(fn2, 500);

    debouncedFn1();
    debouncedFn2();

    jest.advanceTimersByTime(300);
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(fn2).toHaveBeenCalledTimes(1);
  });
});
