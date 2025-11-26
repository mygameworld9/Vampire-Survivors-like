
export class InputHandler {
    keys: { [key: string]: boolean } = {};
    joystickVector: { x: number, y: number } = { x: 0, y: 0 };

    constructor() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    setJoystick(x: number, y: number) {
        this.joystickVector.x = x;
        this.joystickVector.y = y;
    }
}
