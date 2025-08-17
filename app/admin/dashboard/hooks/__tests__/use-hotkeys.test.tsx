import React from 'react';
import { render } from '@testing-library/react';
import useHotkeys from '../use-hotkeys';

let registeredCallback: ((event: KeyboardEvent, handler: unknown) => void) | undefined;

jest.mock('react-hotkeys-hook', () => ({
  // Use rest args to avoid unused-parameter warnings
  useHotkeys: (...args: unknown[]) => {
    const callback = args[1] as (event: KeyboardEvent, handler: unknown) => void;
    registeredCallback = callback;
  },
}));

describe('useHotkeys', () => {
  beforeEach(() => {
    registeredCallback = undefined;
  });

  it('invokes callback when not inside an input', () => {
    const cb = jest.fn();
    const TestComponent = () => {
      useHotkeys('ctrl+k', cb);
      return <button data-testid="btn" />;
    };

    const { getByTestId } = render(<TestComponent />);
    const button = getByTestId('btn');

    const event = { target: button } as unknown as KeyboardEvent;
    registeredCallback?.(event, {});

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('ignores events from input elements', () => {
    const cb = jest.fn();
    const TestComponent = () => {
      useHotkeys('ctrl+k', cb);
      return <input data-testid="input" />;
    };

    const { getByTestId } = render(<TestComponent />);
    const input = getByTestId('input');

    const event = { target: input } as unknown as KeyboardEvent;
    registeredCallback?.(event, {});

    expect(cb).not.toHaveBeenCalled();
  });
});
