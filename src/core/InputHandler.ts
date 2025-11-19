export class InputHandler {
    keys: { [key: string]: boolean } = {};
    constructor() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }
}
