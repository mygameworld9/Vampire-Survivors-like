
export type Listener<T = any> = (data: T) => void;

export class EventEmitter {
    private listeners: { [event: string]: Listener[] } = {};

    on<T = any>(event: string, listener: Listener<T>): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    off<T = any>(event: string, listener: Listener<T>): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }

    emit<T = any>(event: string, data?: T): void {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(listener => listener(data));
    }
    
    clear() {
        this.listeners = {};
    }
}
