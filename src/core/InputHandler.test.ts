import { describe, it, expect, beforeEach } from 'vitest';
import { InputHandler } from './InputHandler';

describe('InputHandler', () => {
  let inputHandler: InputHandler;

  beforeEach(() => {
    inputHandler = new InputHandler();
  });

  it('should handle keydown and keyup events', () => {
    // Simulate keydown event
    const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    window.dispatchEvent(keydownEvent);
    expect(inputHandler.keys['ArrowUp']).toBe(true);

    // Simulate keyup event
    const keyupEvent = new KeyboardEvent('keyup', { key: 'ArrowUp' });
    window.dispatchEvent(keyupEvent);
    expect(inputHandler.keys['ArrowUp']).toBe(false);
  });

  it('should set the joystick vector', () => {
    inputHandler.setJoystick(0.5, -0.5);
    expect(inputHandler.joystickVector).toEqual({ x: 0.5, y: -0.5 });
  });
});
