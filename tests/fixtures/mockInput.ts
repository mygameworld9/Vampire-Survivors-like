import type { InputHandler } from '../../src/core/InputHandler';

/**
 * Creates a mock InputHandler with configurable state.
 * The real InputHandler uses `keys` object and `joystickVector`.
 */
export function createMockInput(state: Partial<InputHandler> = {}): InputHandler {
    return {
        keys: {},
        joystickVector: { x: 0, y: 0 },
        setJoystick: () => { },
        ...state
    } as InputHandler;
}

/**
 * Creates input simulating right movement via keyboard.
 */
export function createRightInput(): InputHandler {
    return createMockInput({
        keys: { d: true },
        joystickVector: { x: 0, y: 0 }
    });
}

/**
 * Creates input simulating up movement via keyboard.
 */
export function createUpInput(): InputHandler {
    return createMockInput({
        keys: { w: true },
        joystickVector: { x: 0, y: 0 }
    });
}

/**
 * Creates input simulating movement via joystick.
 */
export function createJoystickInput(x: number, y: number): InputHandler {
    return createMockInput({
        keys: {},
        joystickVector: { x, y }
    });
}

/**
 * Creates input simulating no movement (idle).
 */
export function createIdleInput(): InputHandler {
    return createMockInput({
        keys: {},
        joystickVector: { x: 0, y: 0 }
    });
}
