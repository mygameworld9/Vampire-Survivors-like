
export class ObjectPool<T> {
    private inactive: T[] = [];
    private factory: () => T;

    constructor(factory: () => T) {
        this.factory = factory;
    }

    get(): T {
        if (this.inactive.length > 0) {
            return this.inactive.pop()!;
        }
        return this.factory();
    }

    release(obj: T) {
        this.inactive.push(obj);
    }
}
