
/**
 * Handles all player input, including keyboard and virtual joystick controls.
 * It tracks the state of keys and the virtual joystick vector.
 */
export class InputHandler {
    /** An object to store the current state of keyboard keys (true for pressed, false for released). */
    keys: { [key: string]: boolean } = {};
    /** An object representing the direction and magnitude of the virtual joystick. */
    joystickVector: { x: number, y: number } = { x: 0, y: 0 };

    /**
     * Creates an instance of the InputHandler and sets up keyboard event listeners.
     */
    constructor() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    /**
     * Updates the state of the virtual joystick.
     * This is called by the virtual joystick UI component.
     * @param {number} x - The x-component of the joystick vector (-1 to 1).
     * @param {number} y - The y-component of the joystick vector (-1 to 1).
     */
    setJoystick(x: number, y: number) {
        this.joystickVector.x = x;
        this.joystickVector.y = y;
    }
}
