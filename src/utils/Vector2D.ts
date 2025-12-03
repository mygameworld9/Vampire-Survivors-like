
export class Vector2D {
    constructor(public x: number, public y: number) {}
    
    set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(v: Vector2D): this {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    add(v: Vector2D): this {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v: Vector2D): this {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(scalar: number): this {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    mag(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magSq(): number {
        return this.x * this.x + this.y * this.y;
    }

    dist(v: Vector2D): number {
        return Math.sqrt(this.distSq(v));
    }

    distSq(v: Vector2D): number {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    normalize(): this {
        const mag = Math.sqrt(this.x * this.x + this.y * this.y);
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }
}
